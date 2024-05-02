import { SharedUiSpotMarket } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'

export default function useActiveGridStrategyFormatter(
  market: ComputedRef<SharedUiSpotMarket>,
  strategy: ComputedRef<TradingStrategy>
) {
  const upperBound = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(strategy.value.upperBound).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  })

  const lowerBound = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(strategy.value.lowerBound).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  })

  const creationExecutionPrice = computed(() =>
    new BigNumberInWei(strategy.value.executionPrice)
      .dividedBy(
        new BigNumberInBase(10).pow(
          market.value.quoteToken.decimals - market.value.baseToken.decimals
        )
      )
      .toBase()
  )

  const stopBaseQuantity = computed(() =>
    new BigNumberInWei(strategy.value.baseDeposit || 0).toBase(
      market.value?.baseToken.decimals
    )
  )

  const stopQuoteQuantity = computed(() =>
    new BigNumberInWei(strategy.value.quoteDeposit || 0).toBase(
      market.value?.quoteToken.decimals
    )
  )

  const creationQuoteQuantity = computed(() =>
    new BigNumberInWei(strategy.value.quoteQuantity || 0).toBase(
      market.value?.quoteToken.decimals
    )
  )

  const creationBaseQuantity = computed(() =>
    new BigNumberInWei(strategy.value.baseQuantity).toBase(
      market.value?.baseToken.decimals
    )
  )

  const subscriptionQuoteQuantity = computed(() =>
    new BigNumberInWei(strategy.value.subscriptionQuoteQuantity || 0).toBase(
      market.value?.quoteToken.decimals
    )
  )
  const subscriptionBaseQuantity = computed(() =>
    new BigNumberInWei(strategy.value.subscriptionBaseQuantity).toBase(
      market.value?.baseToken.decimals
    )
  )

  const takeProfit = computed(() =>
    new BigNumberInWei(strategy.value.takeProfitConfig?.exitPrice ?? 0).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  )

  const stopLoss = computed(() =>
    new BigNumberInWei(strategy.value.stopLossConfig?.exitPrice || 0).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  )

  const totalInvestment = computed(() => {
    const baseAmountInUsd = subscriptionBaseQuantity.value.times(
      new BigNumberInWei(strategy.value.executionPrice).toBase(
        market.value?.quoteToken.decimals
      )
    )

    const quoteAmountInUsd = new BigNumberInWei(
      strategy.value.subscriptionQuoteQuantity || 0
    ).toBase(market.value?.quoteToken.decimals)

    return baseAmountInUsd.plus(quoteAmountInUsd)
  })

  return {
    stopLoss,
    upperBound,
    lowerBound,
    takeProfit,
    totalInvestment,
    stopBaseQuantity,
    stopQuoteQuantity,
    creationBaseQuantity,
    creationQuoteQuantity,
    creationExecutionPrice,
    subscriptionBaseQuantity,
    subscriptionQuoteQuantity
  }
}
