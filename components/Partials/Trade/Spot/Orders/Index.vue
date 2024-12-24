<script lang="ts" setup>
import { TradingInterface, UiSpotMarket } from '@/types'

withDefaults(
  defineProps<{
    market: UiSpotMarket
  }>(),
  {}
)

const tradingInterface = useQueryRef('interface', TradingInterface.Standard)
</script>

<template>
  <div class="overflow-x-auto divide-y h-full">
    <PartialsTradeSpotOrdersStandard
      v-if="tradingInterface === TradingInterface.Standard"
      v-bind="{ market }"
    />
    <PartialsTradeSpotOrdersTradingBots v-else v-bind="{ market }" />
  </div>
</template>
