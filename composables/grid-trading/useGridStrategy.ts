import { TradingStrategy, ExitType, StrategyType } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { indexerSpotApi } from '@shared/Service'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { format } from 'date-fns'
import {
  addressAndMarketSlugToSubaccountId,
  durationFormatter
} from '@/app/utils/helpers'
import { SgtMarketType, StrategyStatus } from '@/types'

export const useSpotGridStrategies = (
  strategies: ComputedRef<TradingStrategy[]>
) => {
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()
  const sharedWalletStore = useSharedWalletStore()
  const { aggregatedPortfolioBalances } = useBalance()
  const now = useNow({ interval: 10000 })

  const lastTradedSpotPrice = ref<Record<string, string>>({})

  const filteredStrategies = computed(() =>
    strategies.value.filter(
      (strategy) =>
        spotStore.markets.some(
          (spotMarket) => spotMarket.marketId === strategy.marketId
        ) && strategy.marketType === SgtMarketType.Spot
    )
  )

  const formattedStrategies = computed(() =>
    filteredStrategies.value.map((strategy) => {
      const isActive = strategy.state === StrategyStatus.Active
      const market = spotStore.markets.find(
        (market) => market.marketId === strategy.marketId
      )!

      const subaccountId = addressAndMarketSlugToSubaccountId(
        sharedWalletStore.address,
        market.slug
      )

      const createdAtFormatted = format(
        new Date(Number(strategy.createdAt)),
        'dd MMM HH:mm:ss'
      )

      const durationFormatted = durationFormatter(
        strategy.createdAt,
        strategy.state === StrategyStatus.Active
          ? now.value.getTime()
          : +strategy.updatedAt
      )

      const sgtSubaccountBalances =
        aggregatedPortfolioBalances.value[subaccountId] || []

      const executionPrice = new BigNumberInBase(strategy.executionPrice)

      const upperBound = sharedToBalanceInToken({
        value: strategy.upperBound,
        decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
      })

      const lowerBound = sharedToBalanceInToken({
        value: strategy.lowerBound,
        decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
      })

      const currentBaseBalance = sgtSubaccountBalances.find(
        (balance) => balance.denom === market.baseToken.denom
      )

      const currentQuoteBalance = sgtSubaccountBalances.find(
        (balance) => balance.denom === market.quoteToken.denom
      )

      const currentBaseBalanceAmount = sharedToBalanceInToken({
        value: currentBaseBalance?.totalBalance || 0,
        decimalPlaces: market.baseToken.decimals
      })

      const currentQuoteBalanceAmount = sharedToBalanceInToken({
        value: currentQuoteBalance?.totalBalance || 0,
        decimalPlaces: market.quoteToken.decimals
      })

      const currentUsdValue = new BigNumberInBase(currentBaseBalanceAmount)
        .times(tokenStore.tokenUsdPrice(market.baseToken))
        .plus(
          new BigNumberInBase(currentQuoteBalanceAmount).times(
            tokenStore.tokenUsdPrice(market.quoteToken)
          )
        )

      const initialBaseBalanceAmount = sharedToBalanceInToken({
        value: strategy.subscriptionBaseQuantity,
        decimalPlaces: market.baseToken.decimals
      })

      const initialQuoteBalanceAmount = sharedToBalanceInToken({
        value: strategy.subscriptionQuoteQuantity,
        decimalPlaces: market.quoteToken.decimals
      })

      const initialUsdValue = new BigNumberInBase(initialBaseBalanceAmount)
        .times(executionPrice)
        .plus(
          new BigNumberInBase(initialQuoteBalanceAmount).times(
            // TODO: Use Initial Quote Price
            tokenStore.tokenUsdPrice(market.quoteToken)
          )
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

      const baseAmountInQuote = new BigNumberInWei(
        strategy.subscriptionBaseQuantity || 0
      )
        .toBase(market.baseToken.decimals)
        .times(new BigNumberInBase(strategy.executionPrice))

      const quoteAmount = new BigNumberInWei(
        strategy.subscriptionQuoteQuantity || 0
      ).toBase(market.quoteToken.decimals)

      const initialInvestmentInQuote = baseAmountInQuote
        .plus(quoteAmount)
        .times(tokenStore.tokenUsdPrice(market.quoteToken)) // TODO: Use Initial Quote Price

      const currentMidPrice = new BigNumberInBase(
        lastTradedSpotPrice.value[strategy.marketId] || 0
      )

      const currentBaseQuantity =
        strategy.state === StrategyStatus.Active
          ? currentBaseBalanceAmount
          : sharedToBalanceInToken({
              value: strategy.baseDeposit,
              decimalPlaces: market.baseToken.decimals
            })

      const currentQuoteQuantity =
        strategy.state === StrategyStatus.Active
          ? currentQuoteBalanceAmount
          : sharedToBalanceInToken({
              value: strategy.quoteDeposit,
              decimalPlaces: market.quoteToken.decimals
            })

      const pnl = currentMidPrice.eq(0)
        ? ZERO_IN_BASE
        : new BigNumberInBase(currentQuoteQuantity)
            .plus(
              new BigNumberInBase(currentBaseQuantity).times(currentMidPrice)
            )
            .minus(
              new BigNumberInBase(initialQuoteBalanceAmount).plus(
                new BigNumberInBase(initialBaseBalanceAmount).times(
                  executionPrice
                )
              )
            )

      const percentagePnl = pnl
        .div(initialInvestmentInQuote)
        .times(100)
        .toFixed()

      return {
        pnl: pnl.toFixed(),
        market,
        isActive,
        settleIn,
        stopLoss,
        takeProfit,
        upperBound,
        lowerBound,
        trailingUpper,
        trailingLower,
        percentagePnl,
        currentMidPrice,
        currentUsdValue,
        initialUsdValue,
        durationFormatted,
        createdAtFormatted,
        initialInvestmentInQuote,
        initialBaseBalanceAmount,
        initialQuoteBalanceAmount,
        currentBaseBalanceAmount,
        currentQuoteBalanceAmount,
        marketId: strategy.marketId,
        createdAt: strategy.createdAt,
        strategyType: strategy.strategyType,
        gridMode: strategy.strategyType as StrategyType,
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

    const lastTradedPrices = await indexerSpotApi.fetchTrades({
      marketIds,
      pagination: { limit: marketIds.length }
    })

    lastTradedSpotPrice.value = lastTradedPrices.trades.reduce(
      (acc, trade) => {
        const market = spotStore.markets.find(
          (market) => market.marketId === trade.marketId
        )!

        const price = sharedToBalanceInToken({
          value: trade.price,
          decimalPlaces: market.quoteToken.decimals - market.baseToken.decimals
        })

        acc[trade.marketId] = price
        return acc
      },
      {} as Record<string, string>
    )
  }

  watch(filteredStrategies, fetchSpotLastTradedPrices, { immediate: true })

  return formattedStrategies
}
