<script setup lang="ts">
import { TradingInterface } from '@/types'

const tradingMode = useQueryRef('interface', TradingInterface.Standard)
</script>

<template>
  <div>
    <PartialsTradeFuturesFormStandard
      v-if="tradingMode === TradingInterface.Standard"
    />
    <PartialsTradeFuturesFormTradingBots v-else />
  </div>
</template>
