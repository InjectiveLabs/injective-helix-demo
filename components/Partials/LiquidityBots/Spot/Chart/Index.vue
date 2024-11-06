<script setup lang="ts">
import { UiMarketWithToken } from '~/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)
</script>

<template>
  <div>
    <p class="text-2xl font-semibold">20.4</p>
    <p class="text-sm text-coolGray-500">
      {{
        $t('liquidityBots.currentPriceQuotePerBase', {
          quote: market.quoteToken.symbol,
          base: market.baseToken.symbol
        })
      }}
    </p>

    <PartialsLiquidityBotsSpotChartGridChart v-bind="{ market }" />

    <PartialsLiquidityBotsSpotFormCreateBot class="mt-4" />
  </div>
</template>
