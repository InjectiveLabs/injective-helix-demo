import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  sharedToBalanceInWei,
  sharedToBalanceInTokenInBase
} from '@shared/utils/formatter'
import { WorkerMessageType, WorkerMessageResponseType } from '@/types/worker'
import type { PriceLevel } from '@injectivelabs/sdk-ts'
import type {
  OrderbookWorkerResult,
  OrderbookWorkerMessage,
  OrderbookFormattedRecord
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
        return bPrice.comparedTo(aPrice) as number
      }

      return aPrice.comparedTo(bPrice) as number
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

    function calculateNotionalInfo({
      isBuy,
      isSpot: _isSpot,
      notional,
      baseDecimals: _baseDecimals,
      quoteDecimals: _quoteDecimals
    }: {
      isBuy: boolean
      isSpot: boolean
      notional: string
      baseDecimals: number
      quoteDecimals: number
    }) {
      // When buying, we consume from sells (starting from lowest price)
      // When selling, we consume from buys (starting from highest price)
      const recordsMap = isBuy ? sells : buys

      const sortedArray = Array.from(recordsMap.entries()).sort((a, b) => {
        const aPrice = new BigNumberInBase(a[0])
        const bPrice = new BigNumberInBase(b[0])
        // For buying: sort sells ascending (lowest price first)
        // For selling: sort buys descending (highest price first)
        return isBuy ? aPrice.comparedTo(bPrice) : bPrice.comparedTo(aPrice)
      })

      if (sortedArray.length === 0) {
        self.postMessage({
          messageType: WorkerMessageResponseType.ReceiveNotionalInfo,
          data: {
            quantity: '0',
            worstPrice: '0',
            averagePrice: '0',
            bestPrice: '0'
          }
        } as OrderbookWorkerResult)
        return
      }

      let worstPrice = '0'
      let totalQuantity = 0 // Total quantity we can get
      let totalNotionalUsed = 0 // Total notional value used
      let remainingNotional = new BigNumberInBase(notional)
      const bestPrice = sortedArray[0][0]

      for (const record of sortedArray) {
        const recordPrice = new BigNumberInBase(record[0])
        const recordQuantity = new BigNumberInBase(record[1])

        // Calculate how much quantity we can get with remaining notional at this price
        const maxQuantityAtThisPrice = remainingNotional.dividedBy(recordPrice)

        // Check if we can get all the quantity we need from this price level
        if (maxQuantityAtThisPrice.isLessThanOrEqualTo(recordQuantity)) {
          // We can fill the rest of our notional with this price level
          const quantityToGet = maxQuantityAtThisPrice.toNumber()
          const notionalToUse = remainingNotional.toNumber()
          remainingNotional = new BigNumberInBase(0)
          totalQuantity += quantityToGet
          totalNotionalUsed += notionalToUse
          worstPrice = recordPrice.toFixed()
          break
        } else {
          // We need to consume this entire price level and continue
          const quantityToGet = recordQuantity.toNumber()
          const notionalToUse = recordPrice
            .multipliedBy(recordQuantity)
            .toNumber()
          totalQuantity += quantityToGet
          totalNotionalUsed += notionalToUse
          remainingNotional = remainingNotional.minus(
            recordPrice.multipliedBy(recordQuantity)
          )
          worstPrice = recordPrice.toFixed()
        }
      }

      // Calculate average price based on total notional used and total quantity
      const averagePrice =
        totalQuantity > 0 ? totalNotionalUsed / totalQuantity : 0

      // Check if we have enough liquidity to spend the entire notional
      const enoughLiquidity = remainingNotional.isLessThanOrEqualTo(0)

      self.postMessage({
        messageType: WorkerMessageResponseType.ReceiveNotionalInfo,
        data: {
          quantity: new BigNumberInBase(notional)
            .dividedBy(worstPrice)
            .toFixed(),
          worstPrice,
          averagePrice: String(averagePrice),
          bestPrice,
          enoughLiquidity
        }
      } as OrderbookWorkerResult)
    }

    function calculateQuantityInfo({
      isBuy,
      isSpot: _isSpot,
      quantity,
      baseDecimals: _baseDecimals,
      quoteDecimals: _quoteDecimals
    }: {
      isBuy: boolean
      isSpot: boolean
      quantity: string
      baseDecimals: number
      quoteDecimals: number
    }) {
      // When buying, we consume from sells (starting from lowest price)
      // When selling, we consume from buys (starting from highest price)
      const recordsMap = isBuy ? sells : buys

      const sortedArray = Array.from(recordsMap.entries()).sort((a, b) => {
        const aPrice = new BigNumberInBase(a[0])
        const bPrice = new BigNumberInBase(b[0])
        // For buying: sort sells ascending (lowest price first)
        // For selling: sort buys descending (highest price first)
        return isBuy ? aPrice.comparedTo(bPrice) : bPrice.comparedTo(aPrice)
      })

      if (sortedArray.length === 0) {
        self.postMessage({
          messageType: WorkerMessageResponseType.ReceiveQuantityInfo,
          data: {
            worstPrice: '0',
            averagePrice: '0',
            bestPrice: '0',
            enoughLiquidity: false
          }
        } as OrderbookWorkerResult)
        return
      }

      let worstPrice = '0'
      let totalVolume = 0 // Total cost/value
      let totalQuantityFilled = 0
      let remainingQuantity = new BigNumberInBase(quantity)
      const bestPrice = sortedArray[0][0]

      for (const record of sortedArray) {
        const recordPrice = new BigNumberInBase(record[0])
        const recordQuantity = new BigNumberInBase(record[1])

        // Check if we can fully fill the remaining quantity with this record
        if (remainingQuantity.isLessThanOrEqualTo(recordQuantity)) {
          // We can fill the rest of our order with this price level
          const quantityToFill = remainingQuantity.toNumber()
          remainingQuantity = new BigNumberInBase(0)
          totalVolume += recordPrice.toNumber() * quantityToFill
          totalQuantityFilled += quantityToFill
          worstPrice = recordPrice.toFixed()
          break
        } else {
          // We need to consume this entire price level and continue
          const quantityToFill = recordQuantity.toNumber()
          totalVolume += recordPrice.toNumber() * quantityToFill
          totalQuantityFilled += quantityToFill
          remainingQuantity = remainingQuantity.minus(recordQuantity)
          worstPrice = recordPrice.toFixed()
        }
      }

      // Calculate average price based on filled quantity
      const averagePrice =
        totalQuantityFilled > 0 ? totalVolume / totalQuantityFilled : 0

      // Check if we have enough liquidity to fill the entire order
      const enoughLiquidity = remainingQuantity.isLessThanOrEqualTo(0)

      self.postMessage({
        messageType: WorkerMessageResponseType.ReceiveQuantityInfo,
        data: {
          worstPrice,
          averagePrice: String(averagePrice),
          bestPrice,
          enoughLiquidity
        }
      } as OrderbookWorkerResult)
    }

    switch (type) {
      case WorkerMessageType.Aggregation:
        sendReplaceOrderbook()
        break

      case WorkerMessageType.Quantity:
        console.log('Quantity', data)
        calculateQuantityInfo(data)
        break

      case WorkerMessageType.Notional:
        console.log('Notional', data)
        calculateNotionalInfo(data)
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
    }
  }
)
