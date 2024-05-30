import { PriceLevel } from '@injectivelabs/sdk-ts'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  OrderbookFormattedRecord,
  OrderbookWorkerMessage,
  OrderbookWorkerResult,
  WorkerMessageResponseType,
  WorkerMessageType
} from '@/types/worker'
import { combineOrderbookRecords } from '@/app/utils/market'

let buys: PriceLevel[] = []
let sells: PriceLevel[] = []

function aggregatePrice(
  price: BigNumber,
  aggregation: number,
  _isBuy: boolean
): string {
  if (aggregation >= 0) {
    return price.dp(aggregation, BigNumber.ROUND_CEIL).toFixed(aggregation)
  } else {
    return price.div(new BigNumber(10).exponentiatedBy(-aggregation)).toFixed(0)
  }
}

function formatRecords({
  isBuy,
  isSpot,
  records,
  aggregation,
  baseDecimals,
  quoteDecimals
}: {
  isBuy: boolean
  isSpot: boolean
  records: PriceLevel[]
  baseDecimals: number
  quoteDecimals: number
  aggregation: number
}) {
  const recordsAggregatedMap = records.reduce(
    (acc, record) => {
      const price = new BigNumberInWei(record.price).toBase(
        isSpot ? quoteDecimals - baseDecimals : quoteDecimals
      )

      const aggregatedPrice = aggregatePrice(price, aggregation, isBuy)

      const quantity = new BigNumberInBase(record.quantity).toWei(
        isSpot ? -baseDecimals : 0
      )

      if (!acc[aggregatedPrice]) {
        acc[aggregatedPrice] = quantity
      } else {
        acc[aggregatedPrice] = acc[aggregatedPrice].plus(quantity)
      }

      return acc
    },
    {} as Record<string, BigNumberInWei>
  )

  const aggregatedRecords = Object.entries(recordsAggregatedMap)
    .map(([price, quantity]) => {
      return {
        price,
        quantity: quantity.toFixed()
      }
    })
    .sort((a, b) => {
      return isBuy
        ? new BigNumber(b.price).comparedTo(new BigNumber(a.price))
        : new BigNumber(a.price).comparedTo(new BigNumber(b.price))
    })

  const recordsWithVolume = aggregatedRecords.reduce<
    OrderbookFormattedRecord[]
  >((acc, record, index) => {
    if (index === 0) {
      return [
        {
          ...record,
          volume: new BigNumberInBase(record.quantity)
            .times(record.price)
            .toFixed(),
          totalVolume: new BigNumberInBase(record.quantity)
            .times(record.price)
            .toFixed(),
          price: record.price,
          quantity: record.quantity,
          totalQuantity: record.quantity,
          avgPrice: record.price
        } as OrderbookFormattedRecord
      ]
    } else {
      const previousRecord = acc[index - 1]
      const volume = new BigNumberInBase(record.quantity).times(record.price)
      const totalQuantity = new BigNumberInBase(record.quantity).plus(
        previousRecord.totalQuantity
      )
      const totalVolume = volume.plus(previousRecord.totalVolume)

      return [
        ...acc,
        {
          ...record,
          volume: volume.toFixed(2),
          totalVolume: totalVolume.toFixed(),
          quantity: record.quantity,
          totalQuantity: totalQuantity.toFixed(),
          avgPrice: totalVolume.div(totalQuantity).toFixed()
        } as OrderbookFormattedRecord
      ]
    }
  }, [])

  return recordsWithVolume
}

self.addEventListener(
  'message',
  (event: MessageEvent<OrderbookWorkerMessage>) => {
    const { data, type } = event.data

    function sendReplaceOrderbook() {
      if (
        type === WorkerMessageType.Fetch ||
        type === WorkerMessageType.Stream ||
        type === WorkerMessageType.Aggregation
      ) {
        const { baseDecimals, isSpot, quoteDecimals, aggregation } = data

        self.postMessage({
          messageType: WorkerMessageResponseType.ReplaceOrderbook,
          data: {
            buys: formatRecords({
              records: buys,
              aggregation,
              baseDecimals,
              isBuy: true,
              isSpot,
              quoteDecimals
            }).slice(0, 3000),
            sells: formatRecords({
              records: sells,
              aggregation,
              baseDecimals,
              isBuy: false,
              isSpot,
              quoteDecimals
            }).slice(0, 3000)
          }
        } as OrderbookWorkerResult)
      }
    }

    function sendWorstPrice(worstPrice: string) {
      self.postMessage({
        messageType: WorkerMessageResponseType.WorstPrice,
        data: {
          worstPrice
        }
      } as OrderbookWorkerResult)
    }

    switch (type) {
      case WorkerMessageType.WorstPrice:
        sendWorstPrice(data.quantity)
        break

      case WorkerMessageType.Aggregation:
        sendReplaceOrderbook()
        break

      case WorkerMessageType.Fetch:
        buys = data.orderbook.buys
        sells = data.orderbook.sells
        sendReplaceOrderbook()
        break

      case WorkerMessageType.Stream:
        buys = combineOrderbookRecords({
          currentRecords: buys,
          updatedRecords: data.orderbook.buys,
          isBuy: true
        })
        sells = combineOrderbookRecords({
          currentRecords: sells,
          updatedRecords: data.orderbook.sells,
          isBuy: false
        })
        sendReplaceOrderbook()
        break
    }
  }
)
