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
import { spotGridMarkets } from '@/app/data/grid-strategy'

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

export const addressAndMarketSlugToSubaccountId = (
  ethAddress: string,
  slug: string
) => {
  const marketHex = stringToHex(slug)

  return `${ethAddress}${'0'.repeat(66 - 42 - marketHex.length)}${marketHex}`
}

export const isSgtSubaccountId = (subaccountId: string) => {
  const MAX_ALLOWED_INDEX = 1000 /** TODO */
  const subaccountIdPrefix = subaccountId.slice(42).replace(/^0+/, '')
  const subaccountIdIndex = parseInt(subaccountIdPrefix, 16)

  return subaccountIdIndex > MAX_ALLOWED_INDEX
}

export const getMarketSlugFromSubaccountId = (subaccountId: string) => {
  if (isSgtSubaccountId(subaccountId)) {
    return spotGridMarkets
      .find(
        (m) =>
          m.slug.toLowerCase() ===
          hexToString(subaccountId.slice(42).replace(/^0+/, '')).toLowerCase()
      )
      ?.slug.toUpperCase()
  }

  return hexToString(subaccountId.slice(42).replace(/^0+/, ''))
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
