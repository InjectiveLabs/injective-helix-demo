<script setup lang="ts">
import {
  MarketKey,
  BusEvents,
  UiSpotMarket,
  GridStrategyType,
  InvestmentTypeGst,
  SpotGridTradingForm
} from '@/types'

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const gridStrategyStore = useGridStrategyStore()
const strategyType = ref(GridStrategyType.Auto)

useForm<SpotGridTradingForm>({
  initialValues: {
    investmentType: InvestmentTypeGst.BaseAndQuote
  },
  keepValuesOnUnmount: true
})

const activeStrategy = computed(() => {
  return gridStrategyStore.activeStrategies.find((strategy) => {
    return strategy.marketId === spotMarket.value?.marketId
  })
})

function updateType(type: GridStrategyType) {
  strategyType.value = type
}

function onOpenTradingBotDetails() {
  if (!activeStrategy.value) {
    return
  }

  useEventBus(BusEvents.OpenTradingBotDetails).emit(activeStrategy.value)
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
        :has-active-strategy="!!activeStrategy"
        @update:tab="updateType"
        @view:details="onOpenTradingBotDetails"
      />

      <PartialsTradeSpotFormTradingBotsManual
        v-else
        :has-active-strategy="!!activeStrategy"
        @view:details="onOpenTradingBotDetails"
      />
    </div>
  </div>
</template>
