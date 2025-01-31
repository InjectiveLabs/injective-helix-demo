<script lang="ts" setup>
import {
  SpotTrade,
  TradeDirection,
  DerivativeTrade
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { BusEvents } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivateStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
  }>(),
  {}
)

const markets = computed(() =>
  props.isSpot ? spotStore.markets : derivateStore.markets
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
  const market = markets.value.find(
    ({ marketId }) => marketId === trade.marketId
  )

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
    tokenStore.tokenUsdPrice(market.quoteToken)
  ).times(price)

  notificationStore.success({
    title:
      trade.tradeDirection === TradeDirection.Buy
        ? t('trade.tradeToast.bought', {
            quantity,
            usdPrice,
            symbol: market.baseToken.symbol,
            usdPriceDecimals: market.priceDecimals,
            quantityDecimals: market.quantityDecimals
          })
        : t('trade.tradeToast.sold', {
            quantity,
            usdPrice,
            symbol: market.baseToken.symbol,
            usdPriceDecimals: market.priceDecimals,
            quantityDecimals: market.quantityDecimals
          }),
    isTemplateString: true
  })
}
</script>

<template>
  <div />
</template>
