import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei,
  SECONDS_IN_A_DAY
} from '@injectivelabs/utils'
import {
  PriceLevel,
  SpotMarket,
  DerivativeMarket,
  ExpiryFuturesMarket,
  MsgExecuteContractCompat,
  ExecArgCW20Send,
  isCw20ContractAddress
} from '@injectivelabs/sdk-ts'
import {
  SharedMarketType,
  SharedMarketStatus,
  SharedUiMarketHistory
} from '@shared/types'
import { OrderSide } from '@injectivelabs/ts-types'
import { getCw20AdapterContractForNetwork } from '@injectivelabs/networks'
import type { TokenStatic } from '@injectivelabs/token-metadata'
import {
  newMarketsSlug,
  upcomingMarkets,
  deprecatedMarkets,
  experimentalMarketsSlug,
  slugsToIncludeInRWACategory,
  slugsToIncludeInSolanaCategory,
  slugsToIncludeInCosmosCategory,
  slugsToIncludeInEthereumCategory,
  slugsToIncludeInInjectiveCategory
} from '@/app/data/market'
import { IS_TESTNET, NETWORK } from '@/app/utils/constants'
import { getCw20FromSymbolOrNameAsString } from '@/app/utils/helper'
import {
  MarketRoute,
  UiSpotMarket,
  TradeSubPage,
  DefaultMarket,
  MarketQuoteType,
  MarketTypeOption,
  UiMarketWithToken,
  MarketCategoryType
} from '@/types'

interface PriceLevelMap {
  [price: string]: PriceLevel
}

export const getMarketRoute = (market: UiMarketWithToken): MarketRoute => {
  if (upcomingMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: TradeSubPage.Market,
      params: {
        market: market.slug
      }
    }
  }

  if (deprecatedMarkets.map((m) => m.slug).includes(market.slug)) {
    return {
      name: TradeSubPage.Market,
      params: {
        market: market.slug
      }
    }
  }

  if (market.type === SharedMarketType.Derivative) {
    if (
      [SharedMarketType.Perpetual, SharedMarketType.Futures].includes(
        market.subType
      )
    ) {
      return {
        name: TradeSubPage.Futures,
        params: {
          slug: market.slug
        }
      }
    }

    /* Default derivative market route */
    return {
      name: TradeSubPage.Derivatives,
      params: {
        derivative: market.slug
      }
    }
  }

  if (market.type === SharedMarketType.Spot) {
    return {
      name: TradeSubPage.Spot,
      params: {
        slug: market.slug
      }
    }
  }

  return {
    name: TradeSubPage.Market,
    params: {
      market: market.slug
    }
  }
}

export const getDefaultPerpetualMarketRouteParams = () => {
  return {
    name: TradeSubPage.Futures,
    params: {
      futures: getDefaultFuturesMarket()
    }
  }
}

export const getDefaultSpotMarketRouteParams = () => {
  return {
    name: TradeSubPage.Spot,
    params: {
      spot: DefaultMarket.Spot
    }
  }
}

export const getDefaultFuturesMarket = () =>
  IS_TESTNET ? DefaultMarket.PerpetualTestnet : DefaultMarket.Perpetual

export const marketIsPartOfCategory = (
  activeCategory: MarketCategoryType,
  market: UiMarketWithToken
): boolean => {
  if (activeCategory === MarketCategoryType.All) {
    return market.isVerified
  }

  const isIbcBaseDenomMarket = market.baseToken.denom.startsWith('ibc')

  if (activeCategory === MarketCategoryType.Cosmos) {
    return (
      isIbcBaseDenomMarket ||
      slugsToIncludeInCosmosCategory.includes(market.slug)
    )
  }

  if (activeCategory === MarketCategoryType.Solana) {
    return slugsToIncludeInSolanaCategory.includes(market.slug)
  }

  if (activeCategory === MarketCategoryType.Ethereum) {
    return (
      !isIbcBaseDenomMarket &&
      slugsToIncludeInEthereumCategory.includes(market.slug)
    )
  }

  if (activeCategory === MarketCategoryType.Injective) {
    return slugsToIncludeInInjectiveCategory.includes(market.slug)
  }

  if (activeCategory === MarketCategoryType.Experimental) {
    return experimentalMarketsSlug.includes(market.slug)
  }

  if (activeCategory === MarketCategoryType.RWA) {
    return slugsToIncludeInRWACategory.includes(market.slug)
  }

  return true
}

export const marketIsQuotePair = (
  activeQuote: MarketQuoteType,
  market: UiMarketWithToken
): boolean => {
  if (activeQuote === MarketQuoteType.All) {
    return true
  }

  const usdtSymbolLowercased = MarketQuoteType.USDT.toLowerCase()
  const usdcSymbolLowercased = MarketQuoteType.USDC.toLowerCase()
  const injSymbolLowecased = MarketQuoteType.INJ.toLowerCase()
  const marketQuoteSymbol = market.quoteToken.symbol.toLowerCase()

  if (activeQuote === MarketQuoteType.USDT) {
    return marketQuoteSymbol.includes(usdtSymbolLowercased)
  }

  if (activeQuote === MarketQuoteType.USDC) {
    return marketQuoteSymbol.includes(usdcSymbolLowercased)
  }

  if (activeQuote === MarketQuoteType.INJ) {
    return marketQuoteSymbol.includes(injSymbolLowecased)
  }

  return true
}

export const marketIsPartOfType = ({
  activeType,
  market,
  favoriteMarkets
}: {
  activeType: MarketTypeOption
  market: UiMarketWithToken
  favoriteMarkets: string[]
}): boolean => {
  if (
    activeType === MarketTypeOption.All ||
    activeType === MarketTypeOption.Themes
  ) {
    return true
  }

  if (activeType === MarketTypeOption.Favorites) {
    return favoriteMarkets.includes(market.marketId)
  }

  if (activeType === MarketTypeOption.NewListings) {
    return newMarketsSlug.includes(market.slug)
  }

  if (activeType === MarketTypeOption.Permissionless) {
    return !market.isVerified
  }

  return [market.type, market.subType].includes(
    activeType as unknown as SharedMarketType
  )
}

export const marketIsPartOfSearch = (
  search: string,
  market: UiMarketWithToken
): boolean => {
  const query = search.trim().toLowerCase()

  if (query === '') {
    return true
  }

  return [
    market.ticker,
    market.baseToken.symbol,
    market.quoteToken.symbol,
    market.baseToken.name
  ]
    .map((piece) => piece.toLowerCase())
    .some((value) => (value || '').toLowerCase().startsWith(query))
}

export const getFormattedMarketsHistoryChartData = (
  marketsHistory: SharedUiMarketHistory
) => {
  return marketsHistory.time.map((time, index, times) => {
    const totalPrice =
      marketsHistory.openPrice[index] +
      marketsHistory.highPrice[index] +
      marketsHistory.lowPrice[index] +
      marketsHistory.closePrice[index]

    const yAxisHolcAveragePrice = new BigNumberInBase(totalPrice)
      .dividedBy(4)
      .toNumber()

    const xAxisTime = time - times[0]

    return [xAxisTime, yAxisHolcAveragePrice]
  })
}

export const marketIsInactive = (market: DerivativeMarket) => {
  const HIDDEN_MARKET_TICKERS = [
    'LUNA/UST PERP',
    'STX/USDT PERP',
    'BAYC/WETH PERP',
    'OSMO/USDT PERP',
    'ETH/USDT 19SEP22',
    'BONK/USDT PERP',
    '1000PEPE/USDT PERP',
    'TIA/USDT-30NOV2023',
    'ETH/USDTkv PERP',
    'BTC/USDTkv PERP'
  ]

  return !HIDDEN_MARKET_TICKERS.includes(market.ticker)
}

export const marketIsActive = (market: DerivativeMarket | SpotMarket) => {
  return market.marketStatus === SharedMarketStatus.Active
}

export const marketHasRecentlyExpired = (market: ExpiryFuturesMarket) => {
  const now = Date.now() / 1000
  const secondsInADay = SECONDS_IN_A_DAY.toNumber()

  if (!market) {
    return false
  }

  if (!market.expiryFuturesMarketInfo) {
    return false
  }

  if (!market.expiryFuturesMarketInfo.expirationTimestamp) {
    return false
  }

  const isExpired = market.expiryFuturesMarketInfo.expirationTimestamp <= now

  if (!isExpired) {
    return false
  }

  return (
    market.expiryFuturesMarketInfo.expirationTimestamp + secondsInADay * 7 > now
  )
}

/**
 * 1. if new exists in current, update quantity in current,
 * 2. if new exists in current and quantity is 0, delete from current
 * 3. If new doesn't exist in current, add to current
 **/
export const updateOrderbookRecord = (
  currentRecords: PriceLevel[] = [],
  updatedRecords: PriceLevel[] = []
) => {
  const currentRecordsMap: PriceLevelMap = currentRecords.reduce(
    (currentRecordsMap, record) => {
      currentRecordsMap[record.price] = record

      return currentRecordsMap
    },
    {} as PriceLevelMap
  )

  updatedRecords.forEach((record) => {
    currentRecordsMap[record.price] = record
  })

  return Object.values(currentRecordsMap).filter((record) =>
    new BigNumber(record.quantity).gt(0)
  )
}

export const combineOrderbookRecords = ({
  isBuy,
  updatedRecords = [],
  currentRecords = []
}: {
  isBuy: boolean
  updatedRecords?: PriceLevel[]
  currentRecords?: PriceLevel[]
}) => {
  const combinedOrderbookRecords = updateOrderbookRecord(
    currentRecords,
    updatedRecords
  )

  return combinedOrderbookRecords.sort((a, b) => {
    return isBuy
      ? new BigNumberInBase(b.price).minus(a.price).toNumber()
      : new BigNumberInBase(a.price).minus(b.price).toNumber()
  })
}

export const getNewMarketSlugFromWHDenom = (denom: string) => {
  switch (denom) {
    case getCw20FromSymbolOrNameAsString('SOLlegacy'):
      return 'sol-usdt'
    case getCw20FromSymbolOrNameAsString('ARBlegacy'):
      return 'arb-usdt'
    case getCw20FromSymbolOrNameAsString('WMATIClegacy'):
      return 'wmatic-usdt'
  }
}

export const getNewMarketTickerFromWHDenom = (denom: string) => {
  switch (denom) {
    case getCw20FromSymbolOrNameAsString('SOLlegacy'):
      return 'SOL/USDT'
    case getCw20FromSymbolOrNameAsString('ARBlegacy'):
      return 'ARB/USDT'
    case getCw20FromSymbolOrNameAsString('WMATIClegacy'):
      return 'WMATIC/USDT'
  }
}

/**
 * Add a Cw20 conversion message if:
 * 1. The base token is cw20
 *  1.1 Limit/Market SELL
 *  1.2 We don't have enough base token balance in the bank balance
 *
 * 2. The quote token is cw20
 * 2.1 Limit/Market BUY
 * 2.2 We don't have enough quote token balance in the bank balance
 */
export const convertCw20ToBankBalance = ({
  injectiveAddress,
  market,
  order,
  bankBalancesMap,
  cw20BalancesMap
}: {
  injectiveAddress: string
  market: UiSpotMarket
  order: {
    price: string
    orderSide: OrderSide
    quantity: string
    market: UiSpotMarket
  }
  bankBalancesMap: Record<string, string>
  cw20BalancesMap: Record<string, string>
}) => {
  const [baseCw20Address] = market.baseDenom.split('/').reverse()
  const [quoteCw20Address] = market.quoteDenom.split('/').reverse()

  if (order.orderSide === OrderSide.Buy) {
    if (!quoteCw20Address) {
      return
    }

    const hasSufficientBalanceInBank = new BigNumberInWei(
      bankBalancesMap[market.quoteDenom] || 0
    ).gte(new BigNumberInBase(order.price).times(order.quantity))

    if (!hasSufficientBalanceInBank) {
      return
    }

    if (!cw20BalancesMap[quoteCw20Address]) {
      return
    }

    return MsgExecuteContractCompat.fromJSON({
      contractAddress: quoteCw20Address,
      sender: injectiveAddress,
      execArgs: ExecArgCW20Send.fromJSON({
        contractAddress: getCw20AdapterContractForNetwork(NETWORK),
        amount: cw20BalancesMap[quoteCw20Address]
      })
    })
  }

  if (order.orderSide === OrderSide.Sell) {
    if (!baseCw20Address) {
      return
    }

    const hasSufficientBalanceInBank = new BigNumberInWei(
      bankBalancesMap[market.baseDenom] || 0
    ).gte(order.quantity)

    if (!hasSufficientBalanceInBank) {
      return
    }

    if (!cw20BalancesMap[baseCw20Address]) {
      return
    }

    return MsgExecuteContractCompat.fromJSON({
      contractAddress: baseCw20Address,
      sender: injectiveAddress,
      execArgs: ExecArgCW20Send.fromJSON({
        contractAddress: getCw20AdapterContractForNetwork(NETWORK),
        amount: cw20BalancesMap[baseCw20Address]
      })
    })
  }
}

/**
 * Add a Cw20 conversion message if:
 * 1. The base token is cw20 and doesn't have enough balance in the bank
 */
export const convertCw20ToBankBalanceForSwap = ({
  token,
  quantity,
  injectiveAddress,
  bankBalancesMap,
  cw20BalancesMap
}: {
  token: TokenStatic
  quantity: string
  injectiveAddress: string
  bankBalancesMap: Record<string, string>
  cw20BalancesMap: Record<string, string>
}) => {
  const [cw20Address] = token.denom.split('/').reverse()

  if (!cw20Address) {
    return
  }

  if (!isCw20ContractAddress(cw20Address)) {
    return
  }

  const quantityInWei = new BigNumberInBase(quantity).toWei(token.decimals)
  const hasSufficientBalanceInBank = new BigNumberInWei(
    bankBalancesMap[token.denom] || 0
  ).gte(quantityInWei.toFixed())

  if (hasSufficientBalanceInBank) {
    return
  }

  return MsgExecuteContractCompat.fromJSON({
    contractAddress: cw20Address,
    sender: injectiveAddress,
    execArgs: ExecArgCW20Send.fromJSON({
      contractAddress: getCw20AdapterContractForNetwork(NETWORK),
      amount: cw20BalancesMap[cw20Address]
    })
  })
}
