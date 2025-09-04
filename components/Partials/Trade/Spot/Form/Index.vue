<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import {
  MarketKey,
  UiSpotMarket,
  TradingInterface,
  SpotMarketCyTags
} from '@/types'

const jsonStore = useSharedJsonStore()

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const queryTradingMode = useQueryRef('interface', TradingInterface.Standard)

const options = computed(() => [
  {
    value: TradingInterface.Standard,
    disabled: false,
    icon: NuxtUiIcons.CandlestickChart
  },
  {
    value: TradingInterface.TradingBots,
    disabled:
      jsonStore.spotGridMarkets.find(
        ({ slug }) => slug === spotMarket.value.slug
      ) === undefined,
    icon: NuxtUiIcons.Robot2
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
    <div
      class="h-subHeader flex border-b"
      :data-cy="dataCyTag(SpotMarketCyTags.SpotTradingMode)"
    >
      <AppButtonSelect
        v-for="{ icon, value, disabled } in options"
        :key="value"
        v-model="queryTradingMode"
        v-bind="{ value, disabled }"
        class="font-bold text-sm flex flex-col gap-1 justify-center items-center px-6 border-r last:border-r-0 text-coolGray-450 flex-1"
        active-classes="bg-brand-875 text-white"
      >
        <UIcon :name="icon" class="size-5 min-w-5" />
        <span class="leading-none">{{ $t(`trade.${value}`) }}</span>
      </AppButtonSelect>
    </div>

    <div>
      <PartialsTradeSpotFormStandard
        v-if="queryTradingMode === TradingInterface.Standard"
      />

      <PartialsTradeSpotFormTradingBots v-else />
    </div>
  </div>
</template>
