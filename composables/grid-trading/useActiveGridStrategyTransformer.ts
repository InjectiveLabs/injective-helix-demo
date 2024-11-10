import { ZERO_IN_BASE } from '@shared/utils/constant'
import { TradingStrategy } from '@injectivelabs/sdk-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { UiSpotMarket } from '@/types'

export default function useActiveGridStrategyFormatter(
  market: ComputedRef<UiSpotMarket>,
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

  const creationExecutionPrice = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInWei(strategy.value.executionPrice).toBase(
      market.value.quoteToken.decimals - market.value.baseToken.decimals
    )
  })

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

  return {
    stopLoss,
    upperBound,
    lowerBound,
    takeProfit,
    stopBaseQuantity,
    stopQuoteQuantity,
    creationBaseQuantity,
    creationQuoteQuantity,
    creationExecutionPrice,
    subscriptionBaseQuantity,
    subscriptionQuoteQuantity
  }
}
