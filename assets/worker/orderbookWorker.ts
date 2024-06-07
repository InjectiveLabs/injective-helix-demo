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
    const price = new BigNumberInWei(priceLevel.price).toBase(
      isSpot ? quoteDecimals - baseDecimals : quoteDecimals
    )

    const quantity = new BigNumberInBase(priceLevel.quantity).toWei(
      isSpot ? -baseDecimals : 0
    )

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
    const aggregatedPrice = aggregatePrice(
      new BigNumber(price),
      aggregation,
      isBuy
    )

    if (!aggregatedMap.has(aggregatedPrice)) {
      aggregatedMap.set(aggregatedPrice, {
        priceSum: [Number(price)],
        totalQuantity: quantity
      })
    } else {
      const { priceSum, totalQuantity } = aggregatedMap.get(aggregatedPrice)!
      aggregatedMap.set(aggregatedPrice, {
        priceSum: [...priceSum, Number(price)],
        totalQuantity: new BigNumber(totalQuantity).plus(quantity).toFixed()
      })
    }
  })

  const sortedAggregatedArray = Array.from(aggregatedMap.entries()).sort(
    (a, b) => {
      if (isBuy) {
        return new BigNumberInBase(b[0]).comparedTo(new BigNumberInBase(a[0]))
      } else {
        return new BigNumberInBase(a[0]).comparedTo(new BigNumberInBase(b[0]))
      }
    }
  )

  const formattedRecords = sortedAggregatedArray.reduce(
    (acc, [price, { totalQuantity, priceSum }], index) => {
      if (index === 0) {
        const avgPrice = new BigNumber(
          priceSum.reduce((a, b) => a + b) / priceSum.length
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
      } else {
        const prevRecord = acc[acc.length - 1]
        const avgPrice = new BigNumber(
          priceSum.reduce((a, b) => a + b) / priceSum.length
        )
        const volume = avgPrice.times(totalQuantity).toFixed()

        acc.push({
          price,
          volume,
          totalQuantity: new BigNumber(totalQuantity)
            .plus(prevRecord.totalQuantity)
            .toFixed(),
          totalVolume: new BigNumber(prevRecord.totalVolume)
            .plus(volume)
            .toFixed(),
          quantity: totalQuantity,
          avgPrice: avgPrice.toFixed()
        })

        return acc
      }
    },
    [] as OrderbookFormattedRecord[]
  )

  return formattedRecords
}

const buys = new Map<string, string>()
const sells = new Map<string, string>()

function aggregatePrice(
  price: BigNumber,
  aggregation: number,
  isBuy: boolean
): string {
  if (aggregation >= 0) {
    if (isBuy) {
      return price.dp(aggregation, BigNumber.ROUND_FLOOR).toFixed(aggregation)
    } else {
      return price.dp(aggregation, BigNumber.ROUND_CEIL).toFixed(aggregation)
    }
  } else {
    return price.div(new BigNumber(10).exponentiatedBy(-aggregation)).toFixed(0)
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
            }),
            sells: priceMapToAggregatedArray({
              aggregation,
              isBuy: false,
              priceMap: sells
            })
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

      case WorkerMessageType.Stream:
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
