import { PriceLevel } from '@injectivelabs/sdk-ts'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  OrderbookFormattedRecord,
  OrderbookWorkerMessage,
  WorkerMessageType
} from '@/types/worker'
import { combineOrderbookRecords } from '@/app/utils/market'
import { ORDERBOOK_ROWS } from '@/app/utils/constants'

let buys: PriceLevel[] = []
let sells: PriceLevel[] = []

function aggregatePrice(
  price: BigNumber,
  aggregation: number,
  isBuy: boolean
): string {
  if (aggregation > 0) {
    return price.toFixed(
      aggregation,
      isBuy ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_CEIL
    )
  } else {
    return price.div(10 ** -aggregation).toFixed(0)
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

      const quantity = new BigNumberInBase(record.quantity).toWei(-baseDecimals)

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
        quantity: quantity.toFixed(2)
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
            .toFixed(2),
          totalVolume: new BigNumberInBase(record.quantity)
            .times(record.price)
            .toFixed(2)
        }
      ]
    } else {
      const previousRecord = acc[index - 1]
      const volume = new BigNumberInBase(record.quantity).times(record.price)

      return [
        ...acc,
        {
          ...record,
          volume: volume.toFixed(2),
          totalVolume: volume.plus(previousRecord.totalVolume).toFixed(2)
        }
      ]
    }
  }, [])

  return recordsWithVolume
}

self.addEventListener(
  'message',
  ({ data }: MessageEvent<OrderbookWorkerMessage>) => {
    const {
      baseDecimals,
      isSpot,
      orderbook,
      quoteDecimals,
      type,
      aggregation
    } = data

    switch (type) {
      case WorkerMessageType.Fetch:
        buys = orderbook.buys
        sells = orderbook.sells
        break
      case WorkerMessageType.Stream:
        buys = combineOrderbookRecords({
          currentRecords: buys,
          updatedRecords: orderbook.buys,
          isBuy: true
        })
        sells = combineOrderbookRecords({
          currentRecords: sells,
          updatedRecords: orderbook.sells,
          isBuy: false
        })
        break
    }

    // console.log('[WORKER]', { buys: buys.length, sells: sells.length })

    self.postMessage({
      buys: formatRecords({
        records: buys,
        aggregation,
        baseDecimals,
        isBuy: true,
        isSpot,
        quoteDecimals
      }).slice(0, ORDERBOOK_ROWS),
      sells: formatRecords({
        records: sells,
        aggregation,
        baseDecimals,
        isBuy: false,
        isSpot,
        quoteDecimals
      }).slice(0, ORDERBOOK_ROWS)
    })
  }
)
