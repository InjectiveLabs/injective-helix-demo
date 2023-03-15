import { Ref } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  Change,
  UiDerivativeTrade,
  ZERO_IN_BASE,
  ZERO_TO_STRING
} from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

export function useDerivativeLastPrice(
  market: Ref<UiMarketWithToken | undefined>
) {
  const derivateStore = useDerivativeStore()

  const latestTrade = computed<UiDerivativeTrade | undefined>(() => {
    if (derivateStore.trades.length === 0) {
      return undefined
    }

    return derivateStore.trades[0]
  })

  const lastTradedPrice = computed(() => {
    if (!market.value || !latestTrade.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(
      new BigNumberInWei(latestTrade.value.executionPrice).toBase(
        market.value.quoteToken.decimals
      )
    )
  })

  const changeInPercentage = computed(() => {
    if (!latestTrade.value) {
      return 0
    }

    const [secondLastTrade] = derivateStore.trades.filter(
      (trade) =>
        !new BigNumberInBase(trade.executionPrice).eq(
          (latestTrade.value as UiDerivativeTrade).executionPrice
        )
    )

    if (!secondLastTrade) {
      return 0
    }

    const lastPrice = new BigNumberInBase(latestTrade.value.executionPrice)
    const secondLastPrice = new BigNumberInBase(secondLastTrade.executionPrice)

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
      return Change.NoChange
    }

    return changeInPercentageInBigNumber.gt(0)
      ? Change.Increase
      : Change.Decrease
  })

  const marketMarkPrice = computed(() => {
    if (!market.value) {
      return ZERO_TO_STRING
    }

    return derivateStore.marketMarkPriceMap[market.value.marketId]?.price
  })

  const markPrice = computed(() => {
    return marketMarkPrice.value || lastTradedPrice.value.toFixed()
  })

  return {
    markPrice,
    lastTradedPrice,
    changeInPercentage,
    lastTradedPriceChange
  }
}
