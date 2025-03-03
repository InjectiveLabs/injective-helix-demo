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
  isBuy,
  isSpot,
  priceMap,
  priceLevels,
  baseDecimals,
  quoteDecimals
}: {
  isBuy: boolean
  isSpot: boolean
  baseDecimals: number
  quoteDecimals: number
  priceLevels: PriceLevel[]
  priceMap: Map<string, string>
}) {
  const currentPrice = priceLevels[0]?.price || '0'

  priceLevels.forEach((priceLevel) => {
    const priceLevelInBigNumber = new BigNumberInBase(priceLevel.price)
    if (
      (isBuy &&
        priceLevelInBigNumber.isLessThan(Number(currentPrice) * 0.01)) ||
      (!isBuy &&
        priceLevelInBigNumber.isGreaterThan(Number(currentPrice) * 1.99))
    ) {
      return
    }

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

function getHighestBuyPrice(buys: Map<string, string>) {
  const buyPrices = [...buys.keys()].map((price) => price)

  if (buyPrices.length === 0) {
    return ''
  }

  return buyPrices.reduce(
    (max, price) =>
      new BigNumberInBase(price).isGreaterThan(max) ? price : max,
    buyPrices[0]
  )
}

function getLowestSellPrice(sells: Map<string, string>) {
  const sellPrices = [...sells.keys()].map((price) => price)

  if (sellPrices.length === 0) {
    return ''
  }

  return sellPrices.reduce(
    (min, price) => (new BigNumberInBase(price).isLessThan(min) ? price : min),
    sellPrices[0]
  )
}

function priceMapToAggregatedArray({
  isBuy,
  priceMap,
  aggregation
}: {
  isBuy: boolean
  aggregation: number
  priceMap: Map<string, string>
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
        totalQuantity: quantity,
        priceSum: [priceInBigNumber.toNumber()]
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
        quantity: totalQuantity,
        avgPrice: avgPrice.toFixed(),
        totalQuantity: new BigNumberInBase(totalQuantity)
          .plus(prevRecord.totalQuantity)
          .toFixed(),
        totalVolume: new BigNumberInBase(prevRecord.totalVolume)
          .plus(volume)
          .toFixed()
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
  isBuy,
  price,
  aggregation
}: {
  isBuy: boolean
  aggregation: number
  price: BigNumberInBase
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
            }).slice(0, 2000),
            highestBuyPrice: getHighestBuyPrice(buys),
            lowestSellPrice: getLowestSellPrice(sells)
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
          isBuy: true,
          priceMap: buys,
          isSpot: data.isSpot,
          priceLevels: data.orderbook.buys,
          baseDecimals: data.baseDecimals,
          quoteDecimals: data.quoteDecimals
        })
        priceLevelsToMap({
          isBuy: false,
          priceMap: sells,
          isSpot: data.isSpot,
          priceLevels: data.orderbook.sells,
          baseDecimals: data.baseDecimals,
          quoteDecimals: data.quoteDecimals
        })

        if (preFetchBuyRecords.length) {
          preFetchBuyRecords.forEach((item) => {
            if (item.sequence < data.sequence) {
              return
            }

            priceLevelsToMap({
              isBuy: true,
              priceMap: buys,
              isSpot: data.isSpot,
              priceLevels: item.records,
              baseDecimals: data.baseDecimals,
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
              isBuy: false,
              priceMap: sells,
              isSpot: data.isSpot,
              priceLevels: item.records,
              baseDecimals: data.baseDecimals,
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
          sequence: data.sequence,
          records: data.orderbook.buys
        })
        preFetchSellRecords.push({
          sequence: data.sequence,
          records: data.orderbook.sells
        })

        priceLevelsToMap({
          isBuy: true,
          priceMap: buys,
          isSpot: data.isSpot,
          priceLevels: data.orderbook.buys,
          baseDecimals: data.baseDecimals,
          quoteDecimals: data.quoteDecimals
        })
        priceLevelsToMap({
          isBuy: false,
          priceMap: sells,
          isSpot: data.isSpot,
          priceLevels: data.orderbook.sells,
          baseDecimals: data.baseDecimals,
          quoteDecimals: data.quoteDecimals
        })

        sendReplaceOrderbook()
        break
    }
  }
)
