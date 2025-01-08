import { format } from 'date-fns'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  ExitType,
  MarketType,
  StrategyType,
  TradingStrategy
} from '@injectivelabs/sdk-ts'
import { formatInterval } from '@/app/utils/helpers'
import {
  BotType,
  StopReason,
  SgtMarketType,
  AccountBalance,
  StrategyStatus,
  UiDerivativeMarket
} from '@/types'

export const useDerivativeGridStrategies = (
  strategiesArg: ComputedRef<TradingStrategy | TradingStrategy[] | undefined>,
  subaccountBalancesMap: ComputedRef<Record<string, AccountBalance[]>>
) => {
  const strategies = computed(() =>
    strategiesArg.value
      ? Array.isArray(strategiesArg.value)
        ? strategiesArg.value
        : [strategiesArg.value]
      : []
  )
  const tokenStore = useTokenStore()
  const derivativeStore = useDerivativeStore()
  const now = useNow({ interval: 10000 })

  const marketsMap = computed(() =>
    derivativeStore.markets.reduce(
      (acc, market) => {
        acc[market.marketId] = market
        return acc
      },
      {} as Record<string, UiDerivativeMarket>
    )
  )

  const filteredStrategies = computed(() => {
    const marketIds = new Set(
      derivativeStore.markets.map(({ marketId }) => marketId)
    )

    return strategies.value.filter(
      (strategy) =>
        marketIds.has(strategy.marketId) &&
        strategy.marketType === SgtMarketType.Derivative
    )
  })

  const formattedStrategies = computed(() =>
    filteredStrategies.value.map((strategy) => {
      const isActive = strategy.state === StrategyStatus.Active
      const market = marketsMap.value[strategy.marketId]

      const marketSubaccountId = strategy.subaccountId

      const createdAtFormatted = format(
        new Date(Number(strategy.createdAt)),
        'dd MMM HH:mm:ss'
      )

      const durationFormatted = formatInterval(
        Number(strategy.createdAt),
        isActive ? now.value.getTime() : Number(strategy.updatedAt)
      )

      const pgtSubaccountBalances =
        subaccountBalancesMap?.value?.[marketSubaccountId] || []

      const executionPrice = new BigNumberInBase(strategy.executionPrice)

      const upperBound = sharedToBalanceInToken({
        value: strategy.upperBound,
        decimalPlaces: market.quoteToken.decimals
      })

      const lowerBound = sharedToBalanceInToken({
        value: strategy.lowerBound,
        decimalPlaces: market.quoteToken.decimals
      })

      const currentAccountQuoteBalance = pgtSubaccountBalances.find(
        (balance) => balance.denom === market.quoteToken.denom
      )

      const currentQuoteAccountBalanceQuantity = sharedToBalanceInToken({
        value: currentAccountQuoteBalance?.totalBalance || 0,
        decimalPlaces: market.quoteToken.decimals
      })

      const currentUsdValue = new BigNumberInBase(
        currentQuoteAccountBalanceQuantity
      ).times(tokenStore.tokenUsdPrice(market.quoteToken))

      const initialQuoteBalanceQuantity = sharedToBalanceInToken({
        value: strategy.subscriptionQuoteQuantity,
        decimalPlaces: market.quoteToken.decimals
      })

      const initialUsdValue = new BigNumberInBase(
        initialQuoteBalanceQuantity
      ).times(
        // TODO: Use Initial Quote Price
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      const stopLoss = strategy.stopLossConfig
        ? {
            exitType: strategy.stopLossConfig.exitType,
            exitPrice: sharedToBalanceInToken({
              value: strategy.stopLossConfig.exitPrice,
              decimalPlaces:
                market.quoteToken.decimals - market.baseToken.decimals
            })
          }
        : undefined

      const takeProfit = strategy.takeProfitConfig
        ? {
            exitType: strategy.takeProfitConfig.exitType,
            exitPrice: sharedToBalanceInToken({
              value: strategy.takeProfitConfig.exitPrice,
              decimalPlaces:
                market.quoteToken.decimals - market.baseToken.decimals
            })
          }
        : undefined

      const settleIn =
        strategy.exitType === ExitType.Base
          ? market.baseToken.symbol
          : strategy.exitType === ExitType.Quote
          ? market.quoteToken.symbol
          : undefined

      const trailingUpper = strategy.trailUpPrice
        ? sharedToBalanceInToken({
            value: strategy.trailUpPrice,
            decimalPlaces:
              market.quoteToken.decimals - market.baseToken.decimals
          })
        : undefined

      const trailingLower = strategy.trailDownPrice
        ? sharedToBalanceInToken({
            value: strategy.trailDownPrice,
            decimalPlaces:
              market.quoteToken.decimals - market.baseToken.decimals
          })
        : undefined

      // PNL

      const depositQuoteQuantity = sharedToBalanceInToken({
        value: strategy.quoteDeposit,
        decimalPlaces: market.quoteToken.decimals
      })

      const depositUsdValue = new BigNumberInBase(depositQuoteQuantity).times(
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      const totalAmount = isActive ? currentUsdValue : depositUsdValue

      const finalQuoteBalanceQuantity = isActive
        ? currentQuoteAccountBalanceQuantity
        : depositQuoteQuantity

      // Bot Type

      let botType = BotType.FuturesGrid

      if (
        strategy.marketType === MarketType.Spot &&
        strategy.strategyType === StrategyType.ArithmeticLP
      ) {
        botType = BotType.LiquidityGrid
      } else if (strategy.marketType === MarketType.Derivative) {
        botType = BotType.FuturesGrid
      }

      const isPositivePnl = new BigNumberInBase(strategy.pnl || '0').gt(0)

      const isZeroPnl = new BigNumberInBase(strategy.pnl || '0').isZero()

      return {
        pnl: strategy.pnl || '0',
        market,
        botType,
        strategy,
        isActive,
        settleIn,
        stopLoss,
        isZeroPnl,
        takeProfit,
        upperBound,
        lowerBound,
        totalAmount,
        isPositivePnl,
        trailingUpper,
        trailingLower,
        currentUsdValue,
        initialUsdValue,
        durationFormatted,
        createdAtFormatted,
        finalQuoteBalanceQuantity,
        initialQuoteBalanceQuantity,
        marketId: strategy.marketId,
        createdAt: strategy.createdAt,
        percentagePnl: strategy.pnlPerc || '0',
        stopReason: strategy.stopReason as StopReason,
        gridMode: strategy.strategyType as StrategyType,
        marketType: strategy.marketType as SgtMarketType,
        currentQuoteAccountBalanceQuantity,
        strategyType: strategy.strategyType,
        subaccountId: strategy.subaccountId,
        executionPrice: executionPrice.toFixed(),
        accountAddress: strategy.accountAddress,
        contractAddress: strategy.contractAddress,
        contractVersion: strategy.contractVersion,
        numberOfGridLevels: strategy.numberOfGridLevels
      }
    })
  )

  return { formattedStrategies }
}
