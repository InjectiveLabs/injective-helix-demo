<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { SharedMarketChange, SharedMarketType } from '@shared/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = withDefaults(
  defineProps<{
    theme: string
    markets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {}
)

const isOpen = ref(false)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

const topGainerMarket = computed(
  () =>
    [...props.markets].sort((a, b) => {
      return Number(b.summary?.change) - Number(a.summary?.change)
    })[0]
)

const priceChangeClasses = computed(() => {
  if (
    !topGainerMarket.value ||
    topGainerMarket.value.summary.lastPriceChange ===
      SharedMarketChange.NoChange
  ) {
    return 'text-gray-350'
  }

  return topGainerMarket.value.summary.lastPriceChange ===
    SharedMarketChange.Increase
    ? 'text-green-500'
    : 'text-red-500'
})

const to = computed(() => ({
  name:
    topGainerMarket.value.market.type === SharedMarketType.Spot
      ? 'spot-slug'
      : 'futures-slug',
  params: {
    slug: topGainerMarket.value.market.slug
  }
}))

const { valueToString: totalVolumeToString } = useSharedBigNumberFormatter(
  computed(() =>
    props.markets.reduce((sum, market) => {
      return sum.plus(market.volumeInUsd)
    }, ZERO_IN_BASE)
  ),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div class="flex p-2 hover:bg-brand-875" :class="{ 'bg-brand-875': isOpen }">
    <div class="flex-1 flex select-none cursor-pointer p-2" @click="toggleOpen">
      <div class="flex items-center space-x-2 py-2">
        <div :class="{ '-rotate-90': !isOpen }">
          <SharedIcon name="triangle" is-sm />
        </div>
        <div class="font-semibold">{{ $t(`markets.themes.${theme}`) }}</div>
      </div>
    </div>

    <div class="flex-1 flex items-center p-2">{{ markets.length }}</div>

    <div class="flex-1 flex items-center p-2 font-mono text-sm justify-end">
      <span>${{ totalVolumeToString }}</span>
    </div>

    <div class="flex-1 flex p-2">
      <div class="flex">
        <NuxtLink
          v-if="topGainerMarket"
          class="flex items-center space-x-4 hover:bg-brand-800 rounded-md py-2 px-4"
          :to="to"
        >
          <CommonTokenIcon
            v-bind="{ token: topGainerMarket.market.baseToken }"
          />
          <div>
            <p class="text-sm font-semibold">
              {{ topGainerMarket.market.ticker }}
            </p>

            <p class="font-mono text-xs" :class="priceChangeClasses">
              <span v-if="Number(topGainerMarket.summary.change) > 0">+</span>
              <span>{{ topGainerMarket.summary.change }}</span>
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>

  <AppCollapse v-bind="{ isOpen }">
    <!-- todo: refactor once we redo themes -->
    <!-- <PartialsMarkets v-bind="{ markets }" /> -->
  </AppCollapse>
</template>
