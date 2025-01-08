<script setup lang="ts">
import { PartialsTradeFuturesOrdersStandard } from '#components'
import { MarketKey, TradingInterface, UiDerivativeMarket } from '@/types'

const tradingMode = useQueryRef('interface', TradingInterface.Standard)

const market = inject(MarketKey) as Ref<UiDerivativeMarket>
</script>

<template>
  <div class="h-full">
    <PartialsTradeFuturesOrdersStandard
      v-if="tradingMode === TradingInterface.Standard"
    />

    <PartialsTradeFuturesOrdersTradingBots
      v-else-if="tradingMode === TradingInterface.TradingBots"
      v-bind="{ market }"
    />
  </div>
</template>
