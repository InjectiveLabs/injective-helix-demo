import {
  BigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { isDevnet, isTestnet } from '@injectivelabs/networks'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { intervalToDuration } from 'date-fns'
import { UI_DEFAULT_DISPLAY_DECIMALS, NETWORK, ENDPOINTS } from './constants'
import { hexToString, stringToHex } from './converters'
import { UiMarketWithToken } from '@/types'
import { spotGridMarkets, perpGridMarkets } from '@/app/data/grid-strategy'
import { OrderbookFormattedRecord } from '~/types/worker'

export const getDecimalsBasedOnNumber = (
  number: number | string | BigNumber,
  defaultDecimals = UI_DEFAULT_DISPLAY_DECIMALS
): { number: BigNumberInBase; decimals: number } => {
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
  return `${ENDPOINTS.indexer}/api/chronos/v1/${marketType}`
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

  const spotMarket = market as UiSpotMarketWithToken

  return market.quoteToken && spotMarket.baseToken
    ? new BigNumberInWei(market.minQuantityTickSize)
        .toBase(spotMarket.baseToken.decimals)
        .toFixed()
    : ''
}

const getProperSlug = (slug: string): string => {
  const edgeCaseSlugs = {
    'wmaticlegacy-usdt': 'wmatic-usdt',
    'arblegacy-usdt': 'arb-usdt',
    'sollegacy-usdt': 'sol-usdt'
  } as { [key: string]: string }

  return edgeCaseSlugs[slug] || slug
}

export const addressAndMarketSlugToSubaccountId = (
  ethAddress: string,
  slug: string
) => {
  const marketHex = stringToHex(getProperSlug(slug))

  return `${ethAddress}${'0'.repeat(66 - 42 - marketHex.length)}${marketHex}`
}

export const isSgtSubaccountId = (subaccountId: string) => {
  const subaccountHex = subaccountId.slice(42).replace(/^0+/, '')

  const slug = hexToString(subaccountHex)

  return spotGridMarkets.find((m) => m.slug === slug)?.slug
}

export const isPgtSubaccountId = (subaccountId: string) => {
  const subaccountHex = subaccountId.slice(42).replace(/^0+/, '')

  const slug = hexToString(subaccountHex)

  return perpGridMarkets.find((m) => m.slug.replace('-perp', '-p') === slug)
    ?.slug
}

export const getMarketSlugFromSubaccountId = (subaccountId: string) => {
  if (isSgtSubaccountId(subaccountId) || isPgtSubaccountId(subaccountId)) {
    return [
      ...spotGridMarkets,
      ...perpGridMarkets.map((m) => ({
        ...m,
        slug: m.slug.replace('-perp', '-p')
      }))
    ]
      .find(
        (m) =>
          m.slug.toLowerCase() ===
          hexToString(subaccountId.slice(42).replace(/^0+/, '')).toLowerCase()
      )
      ?.slug.toUpperCase()
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

export const getSgtContractAddressFromSlug = (slug: string = '') =>
  spotGridMarkets.find((sgt) => sgt.slug === slug)?.contractAddress

export function getMinPriceTickSize(
  isSpot: boolean,
  market: UiMarketWithToken
) {
  if (!isSpot) {
    return new BigNumberInWei(market.minPriceTickSize)
      .toBase(market.quoteToken.decimals)
      .toFixed()
  }

  const spotMarket = market as UiSpotMarketWithToken

  return spotMarket.baseToken
    ? new BigNumberInWei(market.minPriceTickSize)
        .toBase(spotMarket.quoteToken.decimals - spotMarket.baseToken.decimals)
        .toFixed()
    : ''
}

export const durationFormatter = (
  from: number | string,
  to: number | string
) => {
  const { days, hours, minutes } = intervalToDuration({
    start: new Date(Number(from)),
    end: new Date(Number(to))
  })

  return `${days}D ${hours}H ${minutes}M`
}

export const getSgtInvalidRange = ({
  levels,
  midPrice,
  minPriceTickSize
}: {
  midPrice: string | number
  levels: string | number
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

  let worstPrice = '0'
  let price = 0
  let hasEnoughLiquidity = false

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
    worstPrice: new BigNumberInBase(worstPrice),
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
      worstPrice = record.price
    } else {
      totalQuantity += remainingTotal / Number(record.price)
      worstPrice = record.price
      hasEnoughLiquidity = true
      break
    }
  }

  return {
    totalQuantity: new BigNumberInBase(totalQuantity),
    hasEnoughLiquidity,
    worstPrice: new BigNumberInBase(worstPrice)
  }
}

export const getCw20AddressFromDenom = (denom: string) => {
  const [address] = denom.split('/').reverse()

  return address
}

// export function calculateWorstQuantity(
//   price: string,
//   records: OrderbookFormattedRecord[]
// ) {
//   let remainingPrice = Number(price || '0')

//   let worstQuantity = '0'
//   let quantity = 0
//   let hasEnoughLiquidity = false

//   for (const record of records) {
//     if (remainingPrice - Number(record.price) * Number(record.quantity) < 0) {
//       worstQuantity = record.quantity

//       quantity += remainingPrice / Number(record.price)

//       hasEnoughLiquidity = true
//       break
//     }

//     remainingPrice -= Number(record.price) * Number(record.quantity)
//     quantity += Number(record.quantity)
//   }

//   return {
//     quantity: quantity.toString(),
//     worstQuantity,
//     hasEnoughLiquidity
//   }
// }
