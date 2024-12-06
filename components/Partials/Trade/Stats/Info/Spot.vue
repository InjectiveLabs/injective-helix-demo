<script setup lang="ts">
import { stableCoinSymbols } from '@/app/data/token'
import { UiMarketWithToken } from '@/types'

const tokenStore = useTokenStore()

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const isStableQuoteAsset = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)

const lastTradedPriceInUsd = computed(() =>
  spotLastTradedPrice.value.times(
    tokenStore.tokenUsdPrice(props.market.quoteToken)
  )
)
</script>

<template>
  <PartialsTradeStatsHeaderItem
    v-if="!isStableQuoteAsset"
    :title="$t('trade.stats.usd_value')"
  >
    <p class="font-mono">
      <AppUsdAmount
        v-bind="{
          decimalPlaces: market.priceDecimals,
          amount: lastTradedPriceInUsd.toFixed()
        }"
      />
    </p>
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsInfoCommon v-bind="{ market, isSpot: true }" />
</template>
