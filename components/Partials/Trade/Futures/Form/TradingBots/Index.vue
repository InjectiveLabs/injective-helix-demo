<script setup lang="ts">
import {
  DerivativeGridTradingForm,
  GridStrategyType,
  MarketKey,
  UiDerivativeMarket
} from '@/types'

const futuresMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const gridStrategyStore = useGridStrategyStore()

const strategyType = ref(GridStrategyType.Manual)

useForm<DerivativeGridTradingForm>({
  keepValuesOnUnmount: true
})

const activeStrategy = computed(() => {
  return gridStrategyStore.activeDerivativeStrategies.find((strategy) => {
    return strategy.marketId === futuresMarket.value?.marketId
  })
})
</script>

<template>
  <div class="p-4">
    <PartialsTradingBotsDerivativeStrategyDetail
      v-if="activeStrategy"
      :active-strategy="activeStrategy"
    />

    <div v-else>
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
  </div>
</template>
