<script setup lang="ts">
import { SharedMarketChange, SharedUiMarketSummary } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { abbreviateNumber } from '@/app/utils/formatters'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
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
const tokenStore = useTokenStore()

const lastTradedPrice = computed(
  () => new BigNumberInBase(props.summary.lastPrice || 0)
)

const { valueToString: lastPriceToString } = useSharedBigNumberFormatter(
  lastTradedPrice,
  { decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS }
)

const { valueToString: lastPriceInUsdToString } = useSharedBigNumberFormatter(
  computed(() =>
    lastTradedPrice.value.times(
      tokenStore.tokenUsdPrice(props.market.quoteToken)
    )
  )
)

const { valueToString: volumeToString, valueToFixed: volumeToFixed } =
  useSharedBigNumberFormatter(computed(() => props.volumeInUsd))

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
  <PartialsCommonMarketRedirection
    v-bind="{ market }"
    :class="{
      'p-4': isMarketsPage
    }"
    class="flex items-center text-gray-350 hover:text-white"
  >
    <div class="flex items-center flex-[2] truncate min-w-0">
      <div
        v-if="!isMarketsPage"
        :class="{
          '!text-blue-500': appStore.favoriteMarkets.includes(market.marketId)
        }"
        class="pr-2 w-8 text-gray-700 hover:text-blue-700"
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

    <div class="flex-1 truncate min-w-0 font-mono text-xs">
      <div>
        {{ lastPriceToString }}
      </div>
      <div class="text-2xs text-gray-500">${{ lastPriceInUsdToString }}</div>
    </div>

    <div
      :class="priceChangeClasses"
      class="flex items-center flex-1 truncate min-w-0 font-mono text-xs"
    >
      {{ summary.change }}%
    </div>

    <div class="flex items-center flex-1 truncate min-w-0 font-mono text-xs">
      ${{ abbreviateNumber(volumeToFixed) || volumeToString }}
    </div>

    <div
      v-if="isMarketsPage"
      class="flex-1 flex items-center p-2 space-x-8 justify-end"
    >
      <NuxtLink class="text-blue-500 hover:text-blue-600">
        {{ $t('trade.trade') }}
      </NuxtLink>

      <div
        :class="{
          '!text-blue-500': appStore.favoriteMarkets.includes(market.marketId)
        }"
        class="pr-2 w-8 text-gray-700 hover:text-blue-700"
        @click.stop.prevent="toggleFavorite"
      >
        <SharedIcon name="star" />
      </div>
    </div>
  </PartialsCommonMarketRedirection>
</template>
