<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { TradingInterface, SpotMarketCyTags, UiMarketWithToken } from '@/types'

const jsonStore = useSharedJsonStore()

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)

const queryTradingMode = useQueryRef('interface', TradingInterface.Standard)

const isMounted = ref(false)

const options = computed(() => [
  {
    disabled: false,
    value: TradingInterface.Standard,
    icon: NuxtUiIcons.CandlestickChart
  },
  {
    icon: NuxtUiIcons.Robot2,
    value: TradingInterface.TradingBots,
    disabled: props.isSpot
      ? jsonStore.spotGridMarkets.find(
          ({ slug }) => slug === props.market.slug
        ) === undefined
      : jsonStore.derivativeGridMarkets.find(
          ({ slug }) => slug === props.market.slug
        ) === undefined
  }
])

onMounted(() => {
  isMounted.value = true

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
      :data-cy="
        isSpot ? dataCyTag(SpotMarketCyTags.SpotTradingMode) : undefined
      "
    >
      <AppButtonSelect
        v-for="{ icon, value, disabled } in options"
        :key="value"
        v-model="queryTradingMode"
        v-bind="{ value, disabled }"
        active-classes="bg-brand-875 text-white"
        class="font-bold text-sm flex flex-col gap-1 justify-center items-center px-6 border-r last:border-r-0 text-coolGray-450 flex-1"
      >
        <UIcon :name="icon" class="size-5 min-w-5" />
        <span class="leading-none">{{ $t(`trade.${value}`) }}</span>
      </AppButtonSelect>
    </div>

    <div>
      <slot
        v-if="isMounted && queryTradingMode === TradingInterface.Standard"
        name="standard"
      />

      <slot v-else name="bots" />
    </div>
  </div>
</template>
