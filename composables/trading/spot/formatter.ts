import { Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  Change,
  UiSpotMarketWithToken,
  UiSpotTrade,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'

export function useSpotLastPriceFormatter(
  market: UiSpotMarketWithToken,
  trades: Ref<UiSpotTrade[]>
) {
  const lastTradedPrice = computed(() => {
    if (trades.value.length === 0) {
      return ZERO_IN_BASE
    }

    const [trade] = trades.value

    return new BigNumberInBase(
      new BigNumberInBase(trade.price).toWei(
        market.baseToken.decimals - market.quoteToken.decimals
      )
    )
  })

  const lastTradedPriceChange = computed(() => {
    if (trades.value.length === 0) {
      return Change.NoChange
    }

    const [trade] = trades.value
    const [secondLastTrade] = trades.value.filter(
      (t) => !new BigNumberInBase(t.price).eq(trade.price)
    )

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(trade.price)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.price)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  })

  return {
    lastTradedPrice,
    lastTradedPriceChange
  }
}
