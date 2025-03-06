import {
  PriceLevel,
  TokenStatic,
  ExecArgCW20Send,
  DerivativeMarket,
  ExpiryFuturesMarket,
  isCw20ContractAddress,
  MsgExecuteContractCompat,
  NEPTUNE_USDT_CW20_CONTRACT
} from '@injectivelabs/sdk-ts'
import { usdtToken } from '@shared/data/token'
import { NETWORK } from '@shared/utils/constant'
import { SharedMarketType, SharedUiMarketHistory } from '@shared/types'
import { BigNumberInBase, SECONDS_IN_A_DAY } from '@injectivelabs/utils'
import { getCw20AdapterContractForNetwork } from '@injectivelabs/networks'
import { neptuneService } from '@/app/Services'
import { NEPTUNE_USDT_BUFFER } from '@/app/utils/constants'
import { upcomingMarkets, deprecatedMarkets } from '@/app/data/market'
import { MarketRoute, TradeSubPage, UiMarketWithToken } from '@/types'

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
    new BigNumberInBase(record.quantity).gt(0)
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

export const prepareOrderMessages = ({
  denom,
  amount
}: {
  denom: string
  amount: string
}) => {
  const accountStore = useAccountStore()
  const sharedWalletStore = useSharedWalletStore()

  const bankBalance = new BigNumberInBase(
    accountStore.balancesMap[denom] || '0'
  )

  const hasSufficientBalanceInBank = new BigNumberInBase(bankBalance).gte(
    amount
  )

  if (hasSufficientBalanceInBank) {
    return []
  }

  if (denom === usdtToken.denom) {
    const cw20Balance = accountStore.cw20BalancesMap[NEPTUNE_USDT_CW20_CONTRACT]

    if (!cw20Balance) {
      return []
    }

    const nUsdtNeededInBank = new BigNumberInBase(amount).minus(bankBalance)

    const nUsdtNeededInCw20 = new BigNumberInBase(
      neptuneService.calculateCw20Amount(
        nUsdtNeededInBank.toNumber(),
        accountStore.neptuneUsdtRedemptionRatio
      )
    )
      .times(1 + NEPTUNE_USDT_BUFFER)
      .integerValue(BigNumberInBase.ROUND_UP)
      .toFixed()

    return [
      neptuneService.createWithdrawMsg({
        amount: nUsdtNeededInCw20,
        sender: sharedWalletStore.injectiveAddress,
        cw20ContractAddress: NEPTUNE_USDT_CW20_CONTRACT
      })
    ]
  }

  const [baseCw20Address] = denom.split('/').reverse()

  if (!baseCw20Address) {
    return []
  }

  const cw20Balance = accountStore.cw20BalancesMap[baseCw20Address]

  if (!cw20Balance) {
    return []
  }

  return [
    MsgExecuteContractCompat.fromJSON({
      contractAddress: baseCw20Address,
      sender: sharedWalletStore.injectiveAddress,
      execArgs: ExecArgCW20Send.fromJSON({
        contractAddress: getCw20AdapterContractForNetwork(NETWORK),
        amount: cw20Balance
      })
    })
  ]
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
  const hasSufficientBalanceInBank = new BigNumberInBase(
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
