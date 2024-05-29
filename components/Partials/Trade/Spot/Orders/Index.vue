<script setup lang="ts">
import { TradingInterface } from '@/types'

const tradingMode = useQueryRef('interface', TradingInterface.Standard)
</script>

<template>
  <div class="min-h-[360px]">
    <PartialsTradeSpotOrdersStandard
      v-if="tradingMode === TradingInterface.Standard"
    />

    <PartialsTradeSpotOrdersTradingBots v-else />
  </div>
</template>
