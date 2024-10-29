<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { spotGridMarkets } from '@/app/json'
import {
  MarketKey,
  UiSpotMarket,
  TradingInterface,
  SpotMarketCyTags
} from '@/types'

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

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
      class="h-header flex border-b"
      :data-cy="dataCyTag(SpotMarketCyTags.SpotTradingMode)"
    >
      <AppButtonSelect
        v-for="{ value, disabled } in options"
        :key="value"
        v-model="queryTradingMode"
        v-bind="{ value, disabled }"
        class="font-bold text-sm flex justify-center items-center px-6 border-r last:border-r-0 text-coolGray-600 flex-1"
        active-classes="bg-brand-875 text-white"
      >
        {{ $t(`trade.${value}`) }}
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
