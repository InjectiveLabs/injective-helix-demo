<script setup lang="ts">
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { LiquidityValues, UiMarketWithToken } from '@/types'

withDefaults(
  defineProps<{
    market: UiMarketWithToken
    liquidityValues: LiquidityValues
    status: Status
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
