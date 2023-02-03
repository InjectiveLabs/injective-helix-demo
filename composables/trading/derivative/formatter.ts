import { Ref } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  Change,
  UiDerivativeTrade,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

export function useDerivativeLastPriceFormatter(
  market: Ref<UiMarketWithToken>
) {
  const derivateStore = useDerivativeStore()

  const latestTrade = computed<UiDerivativeTrade | undefined>(() => {
    if (derivateStore.trades.length === 0) {
      return undefined
    }

    return derivateStore.trades[0]
  })

  const lastTradedPrice = computed(() => {
    if (!latestTrade.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      new BigNumberInWei(latestTrade.value.executionPrice).toBase(
        market.value.quoteToken.decimals
      )
    )
  })

  const lastTradedPriceChange = computed(() => {
    if (!latestTrade.value) {
      return Change.NoChange
    }

    const [secondLastTrade] = derivateStore.trades.filter(
      (t) =>
        !new BigNumberInBase(t.executionPrice).eq(
          (latestTrade.value as UiDerivativeTrade).executionPrice
        )
    )

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(latestTrade.value.executionPrice)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.executionPrice)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  })

  return {
    lastTradedPrice,
    lastTradedPriceChange
  }
}
