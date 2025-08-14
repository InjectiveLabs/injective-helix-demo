import crypto from 'crypto'
import { intervalToDuration } from 'date-fns'
import { SharedMarketType } from '@shared/types'
import { OrderSide } from '@injectivelabs/ts-types'
import { isDevnet, isTestnet } from '@injectivelabs/networks'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  NETWORK,
  ENDPOINTS,
  IS_MAINNET,
  IS_TESTNET,
  ZERO_IN_BASE
} from '@shared/utils/constant'
import { hexToString, stringToHex } from '@/app/utils/converters'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { BotType, MainPage, TradeSubPage, TradingInterface } from '@/types'
import type { PriceLevel } from '@injectivelabs/sdk-ts'
import type { OrderbookFormattedRecord } from '@/types/worker'
import type {
  GridMarket,
  UiSpotMarket,
  UiMarketWithToken,
  GridStrategyTransformed,
  DerivativeGridStrategyTransformed
} from '@/types'

export const getDecimalsBasedOnNumber = (
  number: number | string | BigNumber,
  defaultDecimals = UI_DEFAULT_DISPLAY_DECIMALS
): { decimals: number; number: BigNumberInBase } => {
  const actualNumber = new BigNumber(number)

  if (actualNumber.gte(1e6)) {
    return {
      number: new BigNumberInBase(actualNumber.toFixed(0)),
      decimals: 0
    }
  }

  if (actualNumber.gte(1e4)) {
    return {
      number: new BigNumberInBase(actualNumber.toFixed(1)),
      decimals: 1
    }
  }

  return {
    number: new BigNumberInBase(actualNumber.toFixed(defaultDecimals)),
    decimals: defaultDecimals
  }
}

export const getChronosDatafeedEndpoint = (marketType: string): string => {
  if (IS_MAINNET) {
    // return `https://k8s.mainnet.chart.grpc-web.injective.network/api/chart/v1/${marketType}`
    return `https://k8s.global.mainnet.chart.grpc-web.injective.network/api/chart/v1/${marketType}`
  }

  if (IS_TESTNET) {
    return `https://k8s.testnet.chart.grpc-web.injective.network/api/chart/v1/${marketType}`
  }

  return `${ENDPOINTS.indexer}/api/chart/v1/${marketType}`
}

export const getHubUrl = (): string => {
  if (isDevnet(NETWORK)) {
    return 'https://devnet.hub.injective.dev'
  }

  if (isTestnet(NETWORK)) {
    return 'https://testnet.hub.injective.dev'
  }

  return 'https://hub.injective.network'
}

export const getSubaccountIndex = (subaccount: string) =>
  parseInt(subaccount.slice(42), 16)

export const addBaseSubaccountIndexToAddress = (
  ethAddress: string,
  subaccountIndex: number
) => {
  const subaccountInHex = subaccountIndex.toString(16)

  return `${ethAddress}${'0'.repeat(
    66 - 42 - subaccountInHex.length
  )}${subaccountInHex}`
}

export function getMinQuantityTickSize(
  isSpot: boolean,
  market: UiMarketWithToken
) {
  if (!isSpot) {
    return market.minQuantityTickSize
  }

  const spotMarket = market as UiSpotMarket

  return market.quoteToken && spotMarket.baseToken
    ? sharedToBalanceInToken({
        value: market.minQuantityTickSize,
        decimalPlaces: spotMarket.baseToken.decimals
      })
    : ''
}

const getProperSlug = (slug: string): string => {
  const edgeCaseSlugs = {
    'wmaticlegacy-usdt': 'wmatic-usdt',
    'arblegacy-usdt': 'arb-usdt',
    'sollegacy-usdt': 'sol-usdt',
    'tradfi-usdt-p': 'tfi-usdt' // TODO: Slug is too long, we need to shorten it
  } as { [key: string]: string }

  return edgeCaseSlugs[slug] || slug
}

export const addressAndMarketSlugToSubaccountId = (
  ethAddress: string,
  slug: string
) => {
  const marketSlug = slug.replace('-perp', '-p')

  const marketHex = stringToHex(getProperSlug(marketSlug))

  return `${ethAddress}${'0'.repeat(66 - 42 - marketHex.length)}${marketHex}`
}

export const isSgtSubaccountId = (subaccountId: string) => {
  const jsonStore = useSharedJsonStore()

  const subaccountHex = subaccountId.slice(42).replace(/^0+/, '')

  const slug = hexToString(subaccountHex)

  return jsonStore.spotGridMarkets.find((market) => market.slug === slug)?.slug
}

export const isPgtSubaccountId = (subaccountId: string) => {
  const jsonStore = useSharedJsonStore()

  const subaccountHex = subaccountId.slice(42).replace(/^0+/, '')

  const slug = hexToString(subaccountHex)

  // TODO: Remove when we query the SC for subaccount
  if (slug === 'tfi-usdt') {
    return 'tradfi-usdt-perp'
  }

  return jsonStore.derivativeGridMarkets.find(
    (market) => market.slug.replace('-perp', '-p') === slug
  )?.slug
}

export const isTradingBotSubaccountId = (subaccountId: string) => {
  return isSgtSubaccountId(subaccountId) || isPgtSubaccountId(subaccountId)
}

export const getMarketSlugFromSubaccountId = (subaccountId: string) => {
  const jsonStore = useSharedJsonStore()

  if (isSgtSubaccountId(subaccountId) || isPgtSubaccountId(subaccountId)) {
    const gridMarkets = [
      ...jsonStore.spotGridMarkets,
      ...jsonStore.derivativeGridMarkets.map((market: GridMarket) => ({
        ...market,
        slug: market.slug.replace('-perp', '-p')
      }))
    ] as GridMarket[]

    return gridMarkets
      .find((market) => {
        const slugFromSubaccount = hexToString(
          subaccountId.slice(42).replace(/^0+/, '')
        ).toLowerCase()

        // TODO: Remove when we query the SC for subaccount
        if (
          slugFromSubaccount === 'tfi-usdt' &&
          market.slug === 'tradfi-usdt-p'
        ) {
          return true
        }

        return market.slug.toLowerCase() === slugFromSubaccount
      })
      ?.slug.toUpperCase()
      .replace('-P', '-PERP')
  }

  return hexToString(subaccountId.slice(42).replace(/^0+/, ''))
}

export const getSubaccountLabel = (subaccountId: string): string => {
  const subaccountHex = subaccountId.slice(42).replace(/^0+/, '')

  const subaccountIndex = parseInt(subaccountHex, 16)

  if (subaccountHex === '') {
    return 'Main'
  }

  if (isSgtSubaccountId(subaccountId)) {
    return `SGT ${getMarketSlugFromSubaccountId(subaccountId)}`
  }

  if (isPgtSubaccountId(subaccountId)) {
    return `PGT ${getMarketSlugFromSubaccountId(subaccountId)}`
  }

  return subaccountIndex.toString()
}

export const getSgtContractAddressFromSlug = (slug: string = '') => {
  const jsonStore = useSharedJsonStore()

  return jsonStore.spotGridMarkets.find((sgt) => sgt.slug === slug)
    ?.contractAddress
}

export function getMinPriceTickSize(
  isSpot: boolean,
  market: UiMarketWithToken
) {
  if (!isSpot) {
    return sharedToBalanceInToken({
      value: market.minPriceTickSize,
      decimalPlaces: market.quoteToken.decimals
    })
  }

  const spotMarket = market as UiSpotMarket

  return spotMarket.baseToken
    ? sharedToBalanceInToken({
        value: market.minPriceTickSize,
        decimalPlaces:
          spotMarket.quoteToken.decimals - spotMarket.baseToken.decimals
      })
    : ''
}

export const durationFormatter = (
  from: number | string,
  to: number | string
) => {
  const { months, days, hours, minutes } = intervalToDuration({
    start: new Date(Number(from)),
    end: new Date(Number(to))
  })

  return `${months}M ${days}D ${hours}H ${minutes}M`
}

export function formatInterval(
  startTimestamp: number,
  endTimestamp: number
): string {
  const diffMs = Math.abs(endTimestamp - startTimestamp)

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  // const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

  return `${days}D ${hours}H ${minutes}M`
}

export const getSgtInvalidRange = ({
  levels,
  midPrice,
  minPriceTickSize
}: {
  levels: string | number
  midPrice: string | number
  minPriceTickSize: string | number
}) => {
  const midPriceInBigNumber = new BigNumberInBase(midPrice)
  const levelsInBigNumber = new BigNumberInBase(levels)
  return {
    upperLimit: midPriceInBigNumber.plus(
      levelsInBigNumber.times(minPriceTickSize).times(10)
    ),
    lowerLimit: midPriceInBigNumber.minus(
      levelsInBigNumber.times(minPriceTickSize).times(10)
    )
  }
}

export const pricesToEma = (priceArray: number[], smoothing: number) => {
  const length = priceArray.length

  return priceArray.reduce((acc, currentPrice, i) => {
    if (i === 0) {
      return [...acc, currentPrice]
    } else {
      const ema =
        currentPrice * (smoothing / length) +
        acc[i - 1] * (1 - smoothing / length)
      return [...acc, ema]
    }
  }, [] as number[])
}

export function mergeObjects<T extends Record<any, any>>(
  target: T,
  source: any
): T {
  if (typeof target !== 'object' || typeof source !== 'object') {
    return target
  }

  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (target[key] === undefined) {
          Object.assign(target, { [key]: {} })
        }
        mergeObjects(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return target
}

/**
 * Quantizes a number to a specified precision.
 *
 * @param number - The number to quantize.
 * @param precision - The precision to quantize the number to.
 * @returns The quantized number.
 */
export function quantizeNumber(
  number: number | BigNumberInBase,
  tensMultiplier: number
): BigNumberInBase {
  const numberInBigNumber = new BigNumberInBase(number)

  if (numberInBigNumber.isZero()) {
    return ZERO_IN_BASE
  }

  const divideBy = new BigNumberInBase(10).exponentiatedBy(tensMultiplier)

  return new BigNumberInBase(
    new BigNumberInBase(number)
      .dividedBy(divideBy)
      .dp(0, BigNumber.ROUND_DOWN)
      .times(divideBy)
  )
}

export function calculateWorstPrice(
  quantity: string,
  records: OrderbookFormattedRecord[]
) {
  let remainingQuantity = Number(quantity || '0')

  let price = 0
  let worstPrice = '0'
  let hasEnoughLiquidity = false

  const worstPriceOnOrderBook = [...records].pop()?.price || '0'

  for (const record of records) {
    if (remainingQuantity - Number(record.quantity) <= 0) {
      worstPrice = record.avgPrice
      price += remainingQuantity * Number(record.price)

      hasEnoughLiquidity = true
      break
    }

    remainingQuantity -= Number(record.quantity)
    price += Number(record.quantity) * Number(record.price)
  }

  return {
    totalPrice: new BigNumberInBase(price),
    worstPrice: hasEnoughLiquidity
      ? new BigNumberInBase(worstPrice)
      : new BigNumberInBase(worstPriceOnOrderBook),
    hasEnoughLiquidity
  }
}

export function calculateWorstPriceFromPriceLevel(
  quantity: string,
  records: PriceLevel[]
) {
  let remainingQuantity = Number(quantity || '0')

  let price = 0
  let worstPrice = '0'
  let hasEnoughLiquidity = false

  const worstPriceOnOrderBook = [...records].pop()?.price || '0'

  for (const record of records) {
    if (remainingQuantity - Number(record.quantity) <= 0) {
      worstPrice = record.price
      price += remainingQuantity * Number(record.price)

      hasEnoughLiquidity = true
      break
    }

    remainingQuantity -= Number(record.quantity)
    price += Number(record.quantity) * Number(record.price)
  }

  return {
    totalPrice: new BigNumberInBase(price),
    worstPrice: hasEnoughLiquidity
      ? new BigNumberInBase(worstPrice)
      : new BigNumberInBase(worstPriceOnOrderBook),
    hasEnoughLiquidity
  }
}

export function calculateTotalQuantity(
  total: string,
  records: OrderbookFormattedRecord[]
) {
  let remainingTotal = Number(total || '0')

  let totalQuantity = 0
  let worstPrice = '0'
  let hasEnoughLiquidity = false

  for (const record of records) {
    if (remainingTotal - Number(record.volume) >= 0) {
      remainingTotal -= Number(record.volume)
      totalQuantity += Number(record.quantity)
      worstPrice = record.avgPrice
    } else {
      totalQuantity += remainingTotal / Number(record.price)
      worstPrice = record.avgPrice
      hasEnoughLiquidity = true
      break
    }
  }

  return {
    hasEnoughLiquidity,
    worstPrice: new BigNumberInBase(worstPrice),
    totalQuantity: new BigNumberInBase(totalQuantity)
  }
}

export const getCw20AddressFromDenom = (denom: string) => {
  const [address] = denom.split('/').reverse()

  return address
}

export const getDerivativeOrderTypeToSubmit = ({
  isBuy,
  isPostOnly,
  triggerPrice,
  markPrice,
  isTriggerOrder
}: {
  isBuy: boolean
  markPrice: string
  isPostOnly: boolean
  triggerPrice: string
  isTriggerOrder: boolean
}) => {
  if (isTriggerOrder) {
    const triggerPriceInBase = new BigNumberInBase(triggerPrice)

    return isBuy
      ? triggerPriceInBase.lt(markPrice)
        ? OrderSide.TakeBuy
        : OrderSide.StopBuy
      : triggerPriceInBase.gt(markPrice)
        ? OrderSide.TakeSell
        : OrderSide.StopSell
  }

  switch (true) {
    case isPostOnly && isBuy:
      return OrderSide.BuyPO
    case isBuy:
      return OrderSide.Buy
    case isPostOnly && !isBuy:
      return OrderSide.SellPO
    case !isBuy:
      return OrderSide.Sell
    default:
      return OrderSide.Buy
  }
}

export function countZerosAfterDecimal(num: string) {
  const parts = num.split('.')

  if (parts.length < 2) {
    return 0
  }

  const decimalPart = parts[1]

  let zeroCount = 0

  for (const char of decimalPart) {
    if (char === '0') {
      zeroCount++
    } else {
      break
    }
  }

  return zeroCount
}

export const valueSortFunction = (a: any, b: any, direction: string) => {
  if (direction === 'asc') {
    return new BigNumberInBase(a).comparedTo(new BigNumberInBase(b))
  }

  return new BigNumberInBase(b).comparedTo(new BigNumberInBase(a))
}

export const getTradingBotLinkFromStrategy = (
  strategy: GridStrategyTransformed | DerivativeGridStrategyTransformed
) => {
  if (strategy.market.type === SharedMarketType.Spot) {
    return strategy.market.isVerified
      ? {
          name:
            strategy.botType === BotType.SpotGrid
              ? TradeSubPage.Spot
              : MainPage.TradingBotsLiquidityBotsSpot,
          params: {
            slug:
              strategy.botType === BotType.SpotGrid
                ? strategy.market.slug
                : undefined
          },
          query: {
            interface:
              strategy.botType === BotType.SpotGrid
                ? TradingInterface.TradingBots
                : undefined,
            market:
              strategy.botType === BotType.LiquidityGrid
                ? strategy.market.slug
                : undefined
          }
        }
      : {
          name: TradeSubPage.Futures,
          params: {
            slug: strategy.market.slug
          },
          query: {
            interface: TradingInterface.TradingBots
          }
        }
  }

  return strategy.market.isVerified
    ? {
        name: TradeSubPage.Futures,
        params: {
          slug: strategy.market.slug
        },
        query: {
          interface: TradingInterface.TradingBots
        }
      }
    : {
        name: TradeSubPage.Futures,
        query: {
          interface: TradingInterface.TradingBots,
          marketId: strategy.market.marketId
        }
      }
}

export function generateOnRamperSignature(
  secretKey: string,
  data: string
): string {
  const hmac = crypto.createHmac('sha256', secretKey)
  hmac.update(data)

  return hmac.digest('hex')
}
