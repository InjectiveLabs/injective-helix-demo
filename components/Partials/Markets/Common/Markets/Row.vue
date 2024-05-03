<script setup lang="ts">
import {
  SharedMarketType,
  SharedMarketChange,
  SharedUiMarketSummary
} from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  isMarketsPage: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  summary: {
    type: Object as PropType<SharedUiMarketSummary>,
    required: true
  },

  volumeInUsd: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const appStore = useAppStore()

const lastPriceToString = computed(() =>
  new BigNumberInBase(props.summary.lastPrice || 0).toFormat()
)

const { valueToString: volumeToString } = useSharedBigNumberFormatter(
  computed(() => props.volumeInUsd)
)

const priceChangeClasses = computed(() => {
  if (props.summary.lastPriceChange === SharedMarketChange.NoChange) {
    return 'text-gray-350'
  }

  return props.summary.lastPriceChange === SharedMarketChange.Increase
    ? 'text-green-500'
    : 'text-red-500'
})

function toggleFavorite() {
  appStore.$patch((state) => {
    state.userState = {
      ...state.userState,
      favoriteMarkets: state.userState.favoriteMarkets.includes(
        props.market.marketId
      )
        ? state.userState.favoriteMarkets.filter(
            (marketId) => marketId !== props.market.marketId
          )
        : [...state.userState.favoriteMarkets, props.market.marketId]
    }
  })
}
</script>

<template>
  <NuxtLink
    :to="{
      name: `${
        market.type === SharedMarketType.Spot ? 'spot' : 'futures'
      }-slug`,
      params: { slug: market.slug }
    }"
    class="flex items-center p-2 hover:bg-brand-800 text-gray-350 hover:text-white odd:bg-brand-875/30"
  >
    <div class="flex items-center flex-[2] truncate min-w-0">
      <div
        :class="{
          '!text-green-500': appStore.favoriteMarkets.includes(market.marketId)
        }"
        class="pr-2 w-8 text-gray-700 hover:text-green-700"
        @click.stop.prevent="toggleFavorite"
      >
        <SharedIcon name="star" />
      </div>

      <CommonTokenIcon v-bind="{ token: market.baseToken }" />

      <div class="pl-2 text-sm font-semibold tracking-wide text-white truncate">
        <div>
          {{ market.ticker }}
        </div>
        <div v-if="isMarketsPage" class="text-xs font-normal text-gray-500">
          {{ market.baseToken.name }}
        </div>
      </div>
    </div>

    <div class="flex items-center flex-1 truncate min-w-0 font-mono text-xs">
      {{ lastPriceToString }}
    </div>

    <div
      :class="priceChangeClasses"
      class="flex items-center flex-1 truncate min-w-0 font-mono text-xs"
    >
      {{ summary.change }}%
    </div>
    <div class="flex items-center flex-1 truncate min-w-0 font-mono text-xs">
      $ {{ volumeToString }}
    </div>
  </NuxtLink>
</template>
