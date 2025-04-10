<script setup lang="ts">
import type { LiquidityValues, UiMarketWithToken } from '@/types'
import type { Status, BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    status: Status
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    lastTradedPrice: BigNumberInBase
  }>(),
  {}
)
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotFormVolatilityStrategy />
    <PartialsLiquidityBotsSpotFormDeposit v-bind="{ market }" class="mt-4" />

    <PartialsLiquidityBotsSpotFormDetails
      v-bind="{ market, liquidityValues, status, lastTradedPrice }"
      class="mt-4"
    />
    <PartialsLiquidityBotsSpotFormCreateBot
      v-bind="{ market, liquidityValues }"
      class="mt-4"
    />
  </div>
</template>
