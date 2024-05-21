<script setup lang="ts">
import { TradingInterface } from '@/types'

const tradingMode = useQueryRef('interface', TradingInterface.Standard)
</script>

<template>
  <div>
    <PartialsTradeFuturesOrdersStandard
      v-if="tradingMode === TradingInterface.Standard"
    />

    <PartialsTradeFuturesOrdersTradingBots v-else />
  </div>
</template>
