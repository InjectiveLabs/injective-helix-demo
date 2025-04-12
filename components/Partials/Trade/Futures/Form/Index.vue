<script setup lang="ts">
import { MarketKey, TradingInterface, UiDerivativeMarket } from '@/types'

const jsonStore = useSharedJsonStore()

const derivativeMarket = inject(MarketKey) as Ref<UiDerivativeMarket>

const queryTradingMode = useQueryRef('interface', TradingInterface.Standard)

const options = computed(() => [
  {
    value: TradingInterface.Standard,
    disabled: false
  },
  {
    value: TradingInterface.TradingBots,
    disabled:
      jsonStore.derivativeGridMarkets.find(
        ({ slug }) => slug === derivativeMarket.value.slug
      ) === undefined
  }
])

onMounted(() => {
  if (
    queryTradingMode.value === TradingInterface.TradingBots &&
    options.value.find(({ value }) => value === TradingInterface.TradingBots)
      ?.disabled
  ) {
    queryTradingMode.value = TradingInterface.Standard
  }
})
</script>

<template>
  <div>
    <div class="h-header flex border-b">
      <AppButtonSelect
        v-for="{ value, disabled } in options"
        :key="value"
        v-model="queryTradingMode"
        v-bind="{ value, disabled }"
        class="font-bold text-sm flex justify-center items-center px-6 border-r last:border-r-0 text-coolGray-450 flex-1"
        active-classes="bg-brand-875 text-white"
      >
        {{ $t(`trade.${value}`) }}
      </AppButtonSelect>
    </div>
    <PartialsTradeFuturesFormStandard
      v-if="queryTradingMode === TradingInterface.Standard"
    />
    <PartialsTradeFuturesFormTradingBots v-else />
  </div>
</template>
