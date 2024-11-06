<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)
</script>

<template>
  <div>
    <PartialsLiquidityBotsSpotFormVolatilityStrategy />
    <PartialsLiquidityBotsSpotFormDeposit v-bind="{ market }" class="mt-4" />
    <PartialsLiquidityBotsSpotFormDetails v-bind="{ market }" class="mt-4" />
  </div>
</template>
