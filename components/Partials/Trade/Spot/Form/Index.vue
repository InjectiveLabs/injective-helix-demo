<script setup lang="ts">
import spotGridMarkets from '@/app/data/spotGridMarkets.json'
import { MarketKey, UiSpotMarket, TradingInterface } from '@/types'

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const tradingMode = ref(TradingInterface.Standard)
const queryTradingMode = useQueryRef('interface', TradingInterface.Standard)

const options = computed(() => [
  {
    value: TradingInterface.Standard,
    disabled: false
  },
  {
    value: TradingInterface.TradingBots,
    disabled:
      spotGridMarkets.find(({ slug }) => slug === spotMarket.value.slug) ===
      undefined
  }
])

onMounted(() => {
  if (!Object.values(TradingInterface).includes(queryTradingMode.value)) {
    return
  }

  const tradingModeOption = options.value.find(
    ({ value }) => value === queryTradingMode.value
  )

  if (tradingModeOption && !tradingModeOption.disabled) {
    tradingMode.value = tradingModeOption.value
  }
})

function onTradingModeChange(value: string) {
  const tradingModeOption = options.value.find(
    ({ value: optionValue }) => optionValue === value
  )

  if (tradingModeOption && !tradingModeOption.disabled) {
    queryTradingMode.value = value as TradingInterface
  }
}
</script>

<template>
  <div>
    <div class="h-header flex border-b">
      <AppButtonSelect
        v-for="{ value, disabled } in options"
        :key="value"
        v-model="tradingMode"
        v-bind="{ value, disabled }"
        class="font-bold text-sm flex justify-center items-center px-6 border-r last:border-r-0 text-gray-600 flex-1"
        active-classes="bg-brand-875 text-white"
        @update:model-value="onTradingModeChange"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div>

    <div>
      <PartialsTradeSpotFormStandard
        v-if="tradingMode === TradingInterface.Standard"
      />

      <PartialsTradeSpotFormTradingBots v-else />
    </div>
  </div>
</template>
