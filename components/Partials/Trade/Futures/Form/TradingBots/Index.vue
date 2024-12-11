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
        class="flex-1 border rounded-md"
        active-classes="!border-blue-400"
      >
        <AppButton
          variant="primary-cta"
          :class="[
            'w-full py-1.5 leading-relaxed hover:bg-transparent',
            strategyType === type ? 'text-white' : 'text-coolGray-600'
          ]"
        >
          {{ $t(`sgt.${type}`) }}
        </AppButton>
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
