<script setup lang="ts">
import { SharedMarketChange, SharedUiMarketSummary } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { slugsToIncludeInRWACategory } from '@/app/data/market'
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
const isMobile = useIsMobile()
const tokenStore = useTokenStore()

const isRWAMarket = computed(() =>
  slugsToIncludeInRWACategory.includes(props.market.slug)
)

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
  useSharedBigNumberFormatter(
    computed(() => props.volumeInUsd),
    {
      decimalPlaces: 0
    }
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
  appStore.setUserState({
    ...appStore.userState,
    favoriteMarkets: appStore.userState.favoriteMarkets.includes(
      props.market.marketId
    )
      ? appStore.userState.favoriteMarkets.filter(
          (marketId) => marketId !== props.market.marketId
        )
      : [...appStore.userState.favoriteMarkets, props.market.marketId]
  })
}
</script>

<template>
  <PartialsCommonMarketRedirection
    v-bind="{ market }"
    :class="{
      'p-4': isMarketsPage,
      'py-1 px-2': !isMarketsPage,
      'hover:bg-brand-800': !isMarketsPage
    }"
    class="flex items-center text-gray-350 hover:text-white"
  >
    <div class="flex items-center flex-4 md:flex-3 truncate min-w-0">
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

      <div class="ml-2">
        <CommonHeaderTooltip
          :tooltip="$t('trade.rwa.marketClosedMarketRow')"
          :is-disabled="!isRWAMarket"
          is-not-styled
          text-color-class="text-white"
          :classes="isRWAMarket ? 'border-dashed border-b cursor-pointer' : ''"
        >
          <span>{{ market.ticker }}</span>
        </CommonHeaderTooltip>

        <div v-if="isMarketsPage" class="text-xs font-normal text-gray-500">
          {{ market.baseToken.name }}
        </div>
      </div>
    </div>

    <div class="flex-2 lg:flex-1 truncate min-w-0 font-mono text-xs text-right">
      <div>
        {{ lastPriceToString }}
      </div>
      <div class="text-2xs text-gray-500">${{ lastPriceInUsdToString }}</div>
    </div>

    <div
      :class="priceChangeClasses"
      class="flex items-center flex-2 truncate min-w-0 font-mono text-xs justify-end"
    >
      {{ summary.change }}%
    </div>

    <div
      class="flex items-center justify-end flex-2 truncate min-w-0 font-mono text-xs"
    >
      <span v-if="isMobile || !isMarketsPage">
        ${{ abbreviateNumber(volumeToFixed) || volumeToString }}
      </span>
      <span v-else>${{ volumeToString }}</span>
    </div>

    <div
      v-if="isMarketsPage"
      class="flex-2 flex items-center p-2 space-x-8 justify-end"
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
