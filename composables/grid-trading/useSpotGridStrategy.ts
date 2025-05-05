import { format } from 'date-fns'
import { indexerSpotApi } from '@shared/Service'
import { ExitType } from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  formatInterval,
  addressAndMarketSlugToSubaccountId
} from '@/app/utils/helpers'
import {
  BotType,
  SgtMarketType,
  StrategyStatus,
  IndexerGridStrategyType
} from '@/types'
import type { StopReason, AccountBalance } from '@/types'
import type { TradingStrategy } from '@injectivelabs/sdk-ts'

export const useSpotGridStrategies = (
  strategiesArg: ComputedRef<undefined | TradingStrategy | TradingStrategy[]>,
  subaccountBalancesMap: ComputedRef<Record<string, AccountBalance[]>>
) => {
  const strategies = computed(() =>
    strategiesArg.value
      ? Array.isArray(strategiesArg.value)
        ? strategiesArg.value
        : [strategiesArg.value]
      : []
  )
  const spotStore = useSpotStore()
  const sharedTokenStore = useSharedTokenStore()
  const sharedWalletStore = useSharedWalletStore()
  const now = useNow({ interval: 10000 })

  const status = reactive(new Status(StatusType.Loading))

  const lastTradedSpotPrice = ref<Record<string, string>>({})

  const filteredStrategies = computed(() =>
    strategies.value.filter(
      (strategy) =>
        spotStore.marketByIdOrSlug(strategy.marketId) &&
        strategy.marketType === SgtMarketType.Spot
    )
  )

  const formattedStrategies = computed(() =>
    filteredStrategies.value.map((strategy) => {
      const isActive = strategy.state === StrategyStatus.Active
      const market = spotStore.marketByIdOrSlug(strategy.marketId)!

      const marketSubaccountId = addressAndMarketSlugToSubaccountId(
        sharedWalletStore.authZOrAddress,
        market.slug
      )

      const createdAtFormatted = format(
        new Date(Number(strategy.createdAt)),
        'dd MMM HH:mm:ss'
      )

      const durationFormatted = formatInterval(
        Number(strategy.createdAt),
        isActive ? now.value.getTime() : Number(strategy.updatedAt)
      )

      const sgtSubaccountBalances =
        subaccountBalancesMap?.value?.[marketSubaccountId] || []

      const executionPrice = new BigNumberInBase(strategy.executionPrice)

      const upperBound = sharedToBalanceInToken({
        value: strategy.upperBound,
        decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
      })

      const lowerBound = sharedToBalanceInToken({
        value: strategy.lowerBound,
        decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
      })

      const currentAccountBaseBalance = sgtSubaccountBalances.find(
        (balance) => balance.denom === market.baseToken.denom
      )

      const currentAccountQuoteBalance = sgtSubaccountBalances.find(
        (balance) => balance.denom === market.quoteToken.denom
      )

      const currentBaseAccountBalanceQuantity = sharedToBalanceInToken({
        value: currentAccountBaseBalance?.totalBalance || 0,
        decimalPlaces: market.baseToken.decimals
      })

      const currentQuoteAccountBalanceQuantity = sharedToBalanceInToken({
        value: currentAccountQuoteBalance?.totalBalance || 0,
        decimalPlaces: market.quoteToken.decimals
      })

      const currentUsdValue = new BigNumberInBase(
        currentBaseAccountBalanceQuantity
      )
        .times(lastTradedSpotPrice.value[strategy.marketId] || 0)
        .plus(new BigNumberInBase(currentQuoteAccountBalanceQuantity))
        .times(sharedTokenStore.tokenUsdPrice(market.quoteToken))

      const initialBaseBalanceQuantity = sharedToBalanceInToken({
        value: strategy.subscriptionBaseQuantity,
        decimalPlaces: market.baseToken.decimals
      })

      const initialQuoteBalanceQuantity = sharedToBalanceInToken({
        value: strategy.subscriptionQuoteQuantity,
        decimalPlaces: market.quoteToken.decimals
      })

      const initialUsdValue = new BigNumberInBase(initialBaseBalanceQuantity)
        .times(executionPrice)
        .plus(new BigNumberInBase(initialQuoteBalanceQuantity))
        .times(
          // TODO: Use Initial Quote Price
          sharedTokenStore.tokenUsdPrice(market.quoteToken)
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

      const midPrice = sharedToBalanceInTokenInBase({
        value: strategy.marketMidPrice,
        decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
      })

      const initialInvestmentQuantityInQuote = new BigNumberInBase(
        initialBaseBalanceQuantity
      )
        .times(executionPrice)
        .plus(initialQuoteBalanceQuantity)

      const currentMidPrice = isActive
        ? new BigNumberInBase(lastTradedSpotPrice.value[strategy.marketId] || 0)
        : midPrice

      const depositBaseQuantity = sharedToBalanceInToken({
        value: strategy.baseDeposit,
        decimalPlaces: market.baseToken.decimals
      })

      const depositQuoteQuantity = sharedToBalanceInToken({
        value: strategy.quoteDeposit,
        decimalPlaces: market.quoteToken.decimals
      })

      const currentBaseQuantity = isActive
        ? currentBaseAccountBalanceQuantity
        : depositBaseQuantity

      const currentQuoteQuantity = isActive
        ? currentQuoteAccountBalanceQuantity
        : depositQuoteQuantity

      const currentInvestmentQuantityInQuote = new BigNumberInBase(
        currentBaseQuantity
      )
        .times(currentMidPrice)
        .plus(currentQuoteQuantity)

      const pnl = currentMidPrice.eq(0)
        ? ZERO_IN_BASE
        : new BigNumberInBase(currentInvestmentQuantityInQuote).minus(
            initialInvestmentQuantityInQuote
          )

      const percentagePnl = pnl
        .div(initialInvestmentQuantityInQuote)
        .times(100)
        .toFixed(2)

      const depositUsdValue = new BigNumberInBase(depositBaseQuantity)
        .times(midPrice)
        .plus(depositQuoteQuantity)
        .times(sharedTokenStore.tokenUsdPrice(market.quoteToken))

      const totalAmount = isActive ? currentUsdValue : depositUsdValue

      const finalBaseBalanceQuantity = isActive
        ? currentBaseAccountBalanceQuantity
        : depositBaseQuantity

      const finalQuoteBalanceQuantity = isActive
        ? currentQuoteAccountBalanceQuantity
        : depositQuoteQuantity

      // Bot Type

      let botType = BotType.SpotGrid

      if (
        strategy.marketType === 'spot' &&
        strategy.strategyType === IndexerGridStrategyType.TrailingArithmeticLP
      ) {
        botType = BotType.LiquidityGrid
      } else if (strategy.marketType === 'futures') {
        botType = BotType.FuturesGrid
      }

      const isPositivePnl = pnl.gt(0)

      const isZeroPnl = pnl.isZero()

      const isSpot = true

      return {
        pnl: pnl.toFixed(),
        isSpot,
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
        percentagePnl,
        strategyStatus: strategy.state as StrategyStatus,
        currentMidPrice,
        currentUsdValue,
        initialUsdValue,
        durationFormatted,
        createdAtFormatted,
        finalBaseBalanceQuantity,
        finalQuoteBalanceQuantity,
        initialInvestmentQuantityInQuote,
        initialBaseBalanceQuantity,
        initialQuoteBalanceQuantity,
        currentBaseAccountBalanceQuantity,
        currentQuoteAccountBalanceQuantity,
        marketId: strategy.marketId,
        createdAt: strategy.createdAt,
        stopReason: strategy.stopReason as StopReason,
        strategyType: strategy.strategyType,
        marketType: strategy.marketType as SgtMarketType,
        subaccountId: strategy.subaccountId,
        executionPrice: executionPrice.toFixed(),
        accountAddress: strategy.accountAddress,
        contractAddress: strategy.contractAddress,
        contractVersion: strategy.contractVersion,
        numberOfGridLevels: strategy.numberOfGridLevels
      }
    })
  )

  async function fetchSpotLastTradedPrices() {
    const marketIds = Array.from(
      new Set(filteredStrategies.value.map((strategy) => strategy.marketId))
    )

    if (marketIds.length === 0) {
      return
    }

    const fetchMarketPrice = marketIds.map(async (marketId) => {
      const trades = await indexerSpotApi.fetchTrades({
        marketIds: [marketId],
        pagination: { limit: 1 }
      })

      return {
        marketId,
        price: trades.trades[0].price
      }
    })

    const marketPrices = await Promise.all(fetchMarketPrice)

    lastTradedSpotPrice.value = marketPrices.reduce(
      (acc, { price, marketId }) => {
        const market = spotStore.marketByIdOrSlug(marketId)!

        const formattedPrice = sharedToBalanceInToken({
          value: price,
          decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
        })

        acc[marketId] = formattedPrice

        return acc
      },
      {} as Record<string, string>
    )

    status.setIdle()
  }

  watch(filteredStrategies, fetchSpotLastTradedPrices, { immediate: true })

  return { formattedStrategies, status }
}
