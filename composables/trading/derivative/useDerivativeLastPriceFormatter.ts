import { Ref } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  Change,
  UiDerivativeMarketWithToken,
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

    const markPriceNotScaled =
      derivateStore.marketMarkPriceMap[market.value.marketId]?.price || '0'

    const derivativeMarket = market.value as UiDerivativeMarketWithToken

    if (!derivativeMarket.oracleScaleFactor) {
      return markPriceNotScaled
    }

    if (
      derivativeMarket.quoteToken.decimals ===
      derivativeMarket.oracleScaleFactor
    ) {
      return markPriceNotScaled
    }

    const oracleScalePriceDiff =
      derivativeMarket.quoteToken.decimals - derivativeMarket.oracleScaleFactor

    return oracleScalePriceDiff > 0
      ? new BigNumberInBase(markPriceNotScaled)
          .times(new BigNumberInBase(10).pow(oracleScalePriceDiff))
          .toFixed()
      : new BigNumberInBase(markPriceNotScaled)
          .div(new BigNumberInBase(10).pow(oracleScalePriceDiff))
          .toFixed()
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
