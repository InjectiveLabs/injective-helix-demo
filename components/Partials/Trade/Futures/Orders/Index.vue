<script setup lang="ts">
import { PartialsTradeFuturesOrdersStandard } from '#components'
import { TradingInterface } from '@/types'

const tradingMode = useQueryRef('interface', TradingInterface.Standard)
</script>

<template>
  <div class="h-full">
    <PartialsTradeFuturesOrdersStandard
      v-if="tradingMode === TradingInterface.Standard"
    />

    <PartialsTradeFuturesOrdersTradingBots
      v-else-if="tradingMode === TradingInterface.TradingBots"
    />
  </div>
</template>
