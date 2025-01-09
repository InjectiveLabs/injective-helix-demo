import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedMarketChange, SharedUiDerivativeTrade } from '@shared/types'
import { calculateScaledMarkPrice } from '@/app/client/utils/derivatives'
import { UiDerivativeMarket, UiMarketWithToken } from '@/types'

export function useDerivativeLastPrice(
  market: Ref<UiMarketWithToken | undefined>
) {
  const tokenStore = useTokenStore()
  const derivateStore = useDerivativeStore()

  const latestTrade = computed<SharedUiDerivativeTrade | undefined>(() => {
    if (derivateStore.trades.length === 0) {
      return undefined
    }

    return derivateStore.trades[0]
  })

  const lastTradedPrice = computed(() => {
    if (!market.value || !latestTrade.value) {
      return ZERO_IN_BASE
    }

    return sharedToBalanceInTokenInBase({
      value: latestTrade.value.executionPrice,
      decimalPlaces: market.value.quoteToken.decimals
    })
  })

  const changeInPercentage = computed(() => {
    if (!latestTrade.value) {
      return 0
    }

    const [secondLastTrade] = derivateStore.trades.filter(
      (trade) =>
        !new BigNumberInBase(trade.executionPrice).eq(
          (latestTrade.value as SharedUiDerivativeTrade).executionPrice
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
      return SharedMarketChange.NoChange
    }

    return changeInPercentageInBigNumber.gt(0)
      ? SharedMarketChange.Increase
      : SharedMarketChange.Decrease
  })

  const marketMarkPrice = computed(() => {
    if (!market.value) {
      return '0'
    }

    const markPriceNotScaled =
      derivateStore.marketMarkPriceMap[market.value.marketId]?.price || '0'

    const derivativeMarket = market.value as UiDerivativeMarket

    return calculateScaledMarkPrice({
      market: derivativeMarket,
      markPriceNotScaled: new BigNumberInBase(markPriceNotScaled)
    }).toFixed()
  })

  const markPrice = computed(() => {
    return marketMarkPrice.value || lastTradedPrice.value.toFixed()
  })

  const lastTradedPriceInUsd = computed(() => {
    if (!market.value) {
      return ZERO_IN_BASE
    }

    return lastTradedPrice.value.times(
      tokenStore.tokenUsdPrice(market.value.quoteToken)
    )
  })

  return {
    markPrice,
    marketMarkPrice,
    lastTradedPrice,
    changeInPercentage,
    lastTradedPriceInUsd,
    lastTradedPriceChange
  }
}
