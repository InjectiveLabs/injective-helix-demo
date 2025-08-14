<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { BusEvents } from '@/types'
import type { SpotTrade, DerivativeTrade } from '@injectivelabs/sdk-ts'

const spotStore = useSpotStore()
const derivateStore = useDerivativeStore()
const sharedTokenStore = useSharedTokenStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
  }>(),
  {}
)

onMounted(() => {
  useEventBus(BusEvents.DerivativeStreamLimitTradeExecuted).on((trade) => {
    addSuccessfulTradeToast(trade as DerivativeTrade)
  })

  useEventBus(BusEvents.SpotStreamLimitTradeExecuted).on((trade) => {
    addSuccessfulTradeToast(trade as SpotTrade)
  })
})

function addSuccessfulTradeToast(trade: SpotTrade | DerivativeTrade) {
  const market =
    spotStore.marketByIdOrSlug(trade.marketId) ||
    derivateStore.marketByIdOrSlug(trade.marketId)

  if (!market) {
    return
  }

  const quantity = props.isSpot
    ? sharedToBalanceInTokenInBase({
        value: (trade as SpotTrade).quantity,
        decimalPlaces: market.baseToken.decimals
      })
    : new BigNumberInBase((trade as DerivativeTrade).executionQuantity)

  const price = props.isSpot
    ? sharedToBalanceInWei({
        value: (trade as SpotTrade).price,
        decimalPlaces: market.baseToken.decimals - market.quoteToken.decimals
      })
    : sharedToBalanceInTokenInBase({
        value: (trade as DerivativeTrade).executionPrice,
        decimalPlaces: market.quoteToken.decimals
      })

  const usdPrice = new BigNumberInBase(
    sharedTokenStore.tokenUsdPrice(market.quoteToken)
  )
    .times(price)
    .toFixed(market.priceDecimals)

  notificationStore.success({
    title:
      trade.tradeDirection === TradeDirection.Buy
        ? t('toast.trade.tradeToast.bought', {
            quantity,
            usdPrice,
            symbol: market.baseToken.symbol
          })
        : t('toast.trade.tradeToast.sold', {
            quantity,
            usdPrice,
            symbol: market.baseToken.symbol
          })
  })
}
</script>

<template>
  <div />
</template>
