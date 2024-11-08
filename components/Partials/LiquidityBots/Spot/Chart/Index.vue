<script setup lang="ts">
import { Status } from '@injectivelabs/utils'
import { LiquidityValues, UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    status: Status
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

    <USkeleton v-if="status.isLoading()" class="h-[500px] mt-4" />

    <PartialsLiquidityBotsSpotChartGridChart
      v-else
      v-bind="{ market, liquidityValues, status }"
    />

    <PartialsLiquidityBotsSpotFormCreateBot class="mt-4" />
  </div>
</template>
