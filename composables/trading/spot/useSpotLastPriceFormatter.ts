import { SharedMarketChange } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketWithToken } from '@/types'

export function useSpotLastPrice(market: Ref<UiMarketWithToken>) {
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

  const changeInPercentage = computed(() => {
    if (!latestTrade.value) {
      return 0
    }

    const latestTradePrice = latestTrade.value.price
    const [secondLastTrade] = spotStore.trades.filter(
      (t) => !new BigNumberInBase(t.price).eq(latestTradePrice)
    )

    if (!secondLastTrade) {
      return 0
    }

    const lastPrice = new BigNumberInBase(latestTradePrice)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.price)

    return lastPrice
      .minus(secondLastPrice)
      .dividedBy(secondLastPrice)
      .times(100)
      .toFixed()
  })

  const lastTradedPriceChange = computed(() => {
    const changeInPercentageInBigNumber = new BigNumberInBase(
      changeInPercentage.value
    )

    if (changeInPercentageInBigNumber.eq(0)) {
      return SharedMarketChange.NoChange
    }

    return changeInPercentageInBigNumber.gt(0)
      ? SharedMarketChange.Increase
      : SharedMarketChange.Decrease
  })

  return {
    lastTradedPrice,
    changeInPercentage,
    lastTradedPriceChange
  }
}
