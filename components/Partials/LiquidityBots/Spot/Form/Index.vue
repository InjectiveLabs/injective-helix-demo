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
    <PartialsLiquidityBotsSpotFormVolatilityStrategy />
    <PartialsLiquidityBotsSpotFormDeposit v-bind="{ market }" class="mt-4" />
    <PartialsLiquidityBotsSpotFormDetails
      v-bind="{ market, liquidityValues, status }"
      class="mt-4"
    />
  </div>
</template>
