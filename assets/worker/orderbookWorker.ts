import { PriceLevel } from '@injectivelabs/sdk-ts'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  sharedToBalanceInWei,
  sharedToBalanceInTokenInBase
} from '@shared/utils/formatter'
import {
  WorkerMessageType,
  OrderbookWorkerResult,
  OrderbookWorkerMessage,
  OrderbookFormattedRecord,
  WorkerMessageResponseType
} from '@/types/worker'

function priceLevelsToMap({
  priceLevels,
  priceMap,
  baseDecimals,
  quoteDecimals,
  isSpot
}: {
  priceLevels: PriceLevel[]
  priceMap: Map<string, string>
  baseDecimals: number
  quoteDecimals: number
  isSpot: boolean
}) {
  priceLevels.forEach((priceLevel) => {
    const price = sharedToBalanceInTokenInBase({
      value: priceLevel.price,
      decimalPlaces: isSpot ? quoteDecimals - baseDecimals : quoteDecimals
    })

    const quantity = sharedToBalanceInWei({
      value: priceLevel.quantity,
      decimalPlaces: isSpot ? -baseDecimals : 0
    })

    if (quantity.isEqualTo(0)) {
      priceMap.delete(price.toFixed())
    } else {
      priceMap.set(price.toFixed(), quantity.toFixed())
    }
  })
}

function priceMapToAggregatedArray({
  priceMap,
  aggregation,
  isBuy
}: {
  priceMap: Map<string, string>
  aggregation: number
  isBuy: boolean
}): OrderbookFormattedRecord[] {
  const aggregatedMap = new Map<
    string,
    {
      priceSum: number[]
      totalQuantity: string
    }
  >()

  priceMap.forEach((quantity, price) => {
    const priceInBigNumber = new BigNumberInBase(price)
    const aggregatedPrice = aggregatePrice({
      isBuy,
      aggregation,
      price: priceInBigNumber
    })

    if (!aggregatedMap.has(aggregatedPrice)) {
      aggregatedMap.set(aggregatedPrice, {
        priceSum: [priceInBigNumber.toNumber()],
        totalQuantity: quantity
      })
    } else {
      const { priceSum, totalQuantity } = aggregatedMap.get(aggregatedPrice)!

      aggregatedMap.set(aggregatedPrice, {
        priceSum: [...priceSum, priceInBigNumber.toNumber()],
        totalQuantity: new BigNumberInBase(totalQuantity)
          .plus(quantity)
          .toFixed()
      })
    }
  })

  const sortedAggregatedArray = Array.from(aggregatedMap.entries()).sort(
    (a, b) => {
      const aPrice = new BigNumberInBase(a[0])
      const bPrice = new BigNumberInBase(b[0])

      if (isBuy) {
        return bPrice.comparedTo(aPrice)
      }

      return aPrice.comparedTo(bPrice)
    }
  )

  const formattedRecords = sortedAggregatedArray.reduce(
    (acc, [price, { totalQuantity, priceSum }], index) => {
      if (index === 0) {
        const totalPriceSum = priceSum.reduce((a, b) => a + b)
        const avgPrice = new BigNumberInBase(totalPriceSum).dividedBy(
          priceSum.length
        )
        const volume = avgPrice.times(totalQuantity).toFixed()

        return [
          {
            price,
            volume,
            totalQuantity,
            totalVolume: volume,
            quantity: totalQuantity,
            avgPrice: avgPrice.toFixed()
          }
        ] as OrderbookFormattedRecord[]
      }

      const prevRecord = acc[acc.length - 1]
      const totalPriceSum = priceSum.reduce((a, b) => a + b)
      const avgPrice = new BigNumberInBase(totalPriceSum).dividedBy(
        priceSum.length
      )
      const volume = avgPrice.times(totalQuantity).toFixed()

      acc.push({
        price,
        volume,
        totalQuantity: new BigNumberInBase(totalQuantity)
          .plus(prevRecord.totalQuantity)
          .toFixed(),
        totalVolume: new BigNumberInBase(prevRecord.totalVolume)
          .plus(volume)
          .toFixed(),
        quantity: totalQuantity,
        avgPrice: avgPrice.toFixed()
      })

      return acc
    },
    [] as OrderbookFormattedRecord[]
  )

  return formattedRecords
}

const buys = new Map<string, string>()
const sells = new Map<string, string>()

let preFetchBuyRecords: { sequence: number; records: PriceLevel[] }[] = []
let preFetchSellRecords: { sequence: number; records: PriceLevel[] }[] = []

function aggregatePrice({
  price,
  aggregation,
  isBuy
}: {
  price: BigNumberInBase
  aggregation: number
  isBuy: boolean
}): string {
  if (aggregation >= 0) {
    if (isBuy) {
      return price.dp(aggregation, BigNumber.ROUND_FLOOR).toFixed(aggregation)
    } else {
      return price.dp(aggregation, BigNumber.ROUND_CEIL).toFixed(aggregation)
    }
  } else {
    return price
      .div(new BigNumberInBase(10).exponentiatedBy(-aggregation))
      .toFixed(0)
  }
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
        const { aggregation } = data

        self.postMessage({
          messageType: WorkerMessageResponseType.ReplaceOrderbook,
          data: {
            buys: priceMapToAggregatedArray({
              aggregation,
              isBuy: true,
              priceMap: buys
            }).slice(0, 2000),
            sells: priceMapToAggregatedArray({
              aggregation,
              isBuy: false,
              priceMap: sells
            }).slice(0, 2000)
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
        buys.clear()
        sells.clear()

        priceLevelsToMap({
          priceMap: buys,
          priceLevels: data.orderbook.buys,
          baseDecimals: data.baseDecimals,
          isSpot: data.isSpot,
          quoteDecimals: data.quoteDecimals
        })
        priceLevelsToMap({
          priceMap: sells,
          priceLevels: data.orderbook.sells,
          baseDecimals: data.baseDecimals,
          isSpot: data.isSpot,
          quoteDecimals: data.quoteDecimals
        })

        if (preFetchBuyRecords.length) {
          preFetchBuyRecords.forEach((item) => {
            if (item.sequence < data.sequence) {
              return
            }

            priceLevelsToMap({
              priceMap: buys,
              priceLevels: item.records,
              baseDecimals: data.baseDecimals,
              isSpot: data.isSpot,
              quoteDecimals: data.quoteDecimals
            })
          })

          preFetchBuyRecords = preFetchBuyRecords.filter(
            (record) => record.sequence >= data.sequence
          )
        }

        if (preFetchSellRecords.length) {
          preFetchSellRecords.forEach((item) => {
            if (item.sequence < data.sequence) {
              return
            }

            priceLevelsToMap({
              priceMap: sells,
              priceLevels: item.records,
              baseDecimals: data.baseDecimals,
              isSpot: data.isSpot,
              quoteDecimals: data.quoteDecimals
            })
          })

          preFetchSellRecords = preFetchSellRecords.filter(
            (record) => record.sequence >= data.sequence
          )
        }

        sendReplaceOrderbook()
        break

      case WorkerMessageType.Stream:
        preFetchBuyRecords.push({
          records: data.orderbook.buys,
          sequence: data.sequence
        })
        preFetchSellRecords.push({
          records: data.orderbook.sells,
          sequence: data.sequence
        })

        priceLevelsToMap({
          priceMap: buys,
          priceLevels: data.orderbook.buys,
          baseDecimals: data.baseDecimals,
          isSpot: data.isSpot,
          quoteDecimals: data.quoteDecimals
        })
        priceLevelsToMap({
          priceMap: sells,
          priceLevels: data.orderbook.sells,
          baseDecimals: data.baseDecimals,
          isSpot: data.isSpot,
          quoteDecimals: data.quoteDecimals
        })

        sendReplaceOrderbook()
        break
    }
  }
)
