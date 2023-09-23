import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { UiSpotMarketWithToken, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'

export default function useActiveGridStrategyFormatter(
  market: ComputedRef<UiSpotMarketWithToken>,
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
    new BigNumberInWei(strategy.value.executionPrice).toBase(
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
    new BigNumberInWei(strategy.value.takeProfit || 0).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  )

  const stopLoss = computed(() =>
    new BigNumberInWei(strategy.value.stopLoss || 0).toBase(
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
    creationBaseQuantity,
    creationQuoteQuantity,
    creationExecutionPrice,
    subscriptionBaseQuantity,
    subscriptionQuoteQuantity
  }
}
