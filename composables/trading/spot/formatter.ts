import { Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { Change, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

export function useSpotLastPriceFormatter(market: Ref<UiMarketWithToken>) {
  const spotStore = useSpotStore()

  const latestTrade = computed(() => {
    if (spotStore.trades.length === 0) {
      return undefined
    }

    return spotStore.trades[0]
  })

  const lastTradedPrice = computed(() => {
    if (!latestTrade.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      new BigNumberInBase(latestTrade.value.price).toWei(
        market.value.baseToken.decimals - market.value.quoteToken.decimals
      )
    )
  })

  const lastTradedPriceChange = computed(() => {
    if (!latestTrade.value) {
      return Change.NoChange
    }

    const latestTradePrice = latestTrade.value.price
    const [secondLastTrade] = spotStore.trades.filter(
      (t) => !new BigNumberInBase(t.price).eq(latestTradePrice)
    )

    if (!secondLastTrade) {
      return Change.NoChange
    }

    const lastPrice = new BigNumberInBase(latestTradePrice)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.price)

    return lastPrice.gte(secondLastPrice) ? Change.Increase : Change.Decrease
  })

  return {
    lastTradedPrice,
    lastTradedPriceChange
  }
}
