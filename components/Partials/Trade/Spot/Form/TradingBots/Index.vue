<script setup lang="ts">
import {
  GridStrategyType,
  InvestmentTypeGst,
  SpotGridTradingForm
} from '@/types'

const strategyType = ref(GridStrategyType.Auto)

useForm<SpotGridTradingForm>({
  initialValues: {
    investmentType: InvestmentTypeGst.BaseAndQuote
  },
  keepValuesOnUnmount: true
})

function updateType(type: GridStrategyType) {
  strategyType.value = type
}
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
      <PartialsTradeSpotFormTradingBotsAuto
        v-if="strategyType === GridStrategyType.Auto"
        @update:tab="updateType"
      />

      <PartialsTradeSpotFormTradingBotsManual v-else />
    </div>
  </div>
</template>
