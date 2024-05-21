<script setup lang="ts">
import { TradingInterface } from '@/types'

const tradingMode = useQueryRef('interface', TradingInterface.Standard)
</script>

<template>
  <div>
    <!-- <div class="h-header flex border-b">
      <AppButtonSelect
        v-for="value in Object.values(TradingInterface)"
        :key="value"
        v-model="tradingMode"
        v-bind="{ value }"
        class="font-bold text-sm flex justify-center items-center px-6 border-r last:border-r-0 text-gray-600 flex-1"
        active-classes="bg-brand-875 text-white"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div> -->

    <PartialsTradeFuturesFormStandard
      v-if="tradingMode === TradingInterface.Standard"
    />
    <PartialsTradeFuturesFormTradingBots v-else />
  </div>
</template>
