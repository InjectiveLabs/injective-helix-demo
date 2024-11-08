<script setup lang="ts">
import { DerivativeGridTradingForm, GridStrategyType } from '@/types'

const strategyType = ref(GridStrategyType.Manual)

useForm<DerivativeGridTradingForm>({
  keepValuesOnUnmount: true
})
</script>

<template>
  <div class="p-4">
    <div class="flex mt-4 bg-brand-875 rounded-md">
      <AppButtonSelect
        v-for="type in Object.values(GridStrategyType)"
        :key="type"
        v-bind="{ value: type }"
        v-model="strategyType"
        class="flex-1 p-2 border text-gray-600 border-transparent rounded-md text-sm font-medium"
        active-classes="text-white !border-blue-400"
      >
        {{ $t(`sgt.${type}`) }}
      </AppButtonSelect>
    </div>

    <div>
      <PartialsTradeFuturesFormTradingBotsManual
        v-if="strategyType === GridStrategyType.Manual"
      />

      <PartialsTradeFuturesFormTradingBotsAuto v-else />
    </div>
  </div>
</template>
