import { Ref } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  Change,
  UiDerivativeMarketWithToken,
  UiDerivativeTrade,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'

export function useDerivativeLastPriceFormatter(
  market: UiDerivativeMarketWithToken,
  trades: Ref<UiDerivativeTrade[]>
) {
  const lastTradedPrice = computed(() => {
    if (trades.value.length === 0) {
      return ZERO_IN_BASE
    }
    const [trade] = trades.value

    return new BigNumberInBase(
      new BigNumberInWei(trade.executionPrice).toBase(
        market.quoteToken.decimals
      )
    )
  })

  const lastTradedPriceChange = computed(() => {
    if (trades.value.length === 0) {
      return Change.NoChange
    }

    const [trade] = trades.value
    const [secondLastTrade] = trades.value.filter(
      (t) => !new BigNumberInBase(t.executionPrice).eq(trade.executionPrice)
    )

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(trade.executionPrice)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.executionPrice)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  })

  return {
    lastTradedPrice,
    lastTradedPriceChange
  }
}
