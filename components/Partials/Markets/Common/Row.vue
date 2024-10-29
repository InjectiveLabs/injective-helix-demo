<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  NuxtUiIcons,
  SharedMarketChange,
  SharedUiMarketSummary
} from '@shared/types'
import { abbreviateNumber } from '@/app/utils/formatters'
import { slugsToIncludeInRWACategory } from '@/app/data/market'
import { UiMarketWithToken, MarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
    summary: SharedUiMarketSummary
    volumeInUsd: BigNumberInBase
    isMarketsPage?: boolean
  }>(),
  {
    isMarketsPage: false
  }
)

const appStore = useAppStore()
const isMobile = useIsMobile()

const isRWAMarket = computed(() =>
  slugsToIncludeInRWACategory.includes(props.market.slug)
)

const lastTradedPrice = computed(
  () => new BigNumberInBase(props.summary.lastPrice || 0)
)

const { valueToFixed: lastPriceToFixed } = useSharedBigNumberFormatter(
  lastTradedPrice,
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToFixed: volumeToFixed } = useSharedBigNumberFormatter(
  computed(() => props.volumeInUsd),
  {
    decimalPlaces: 0
  }
)

const priceChangeClasses = computed(() => {
  if (props.summary.lastPriceChange === SharedMarketChange.NoChange) {
    return 'text-coolGray-350'
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
    class="flex items-center text-coolGray-350 hover:text-white"
  >
    <div class="flex items-center flex-[4] md:flex-[3] truncate min-w-0">
      <div
        v-if="!isMarketsPage"
        :class="{
          '!text-blue-500': appStore.favoriteMarkets.includes(market.marketId)
        }"
        class="pr-2 w-8 text-coolGray-700 hover:text-blue-700"
        @click.stop.prevent="toggleFavorite"
      >
        <UIcon :name="NuxtUiIcons.Star" class="h-6 w-6 min-w-6" />
      </div>

      <CommonTokenIcon v-bind="{ token: market.baseToken }" />

      <div class="ml-2">
        <CommonHeaderTooltip
          :tooltip="$t('trade.rwa.marketClosedMarketRow')"
          :is-disabled="!isRWAMarket"
          is-not-styled
          text-color-class="text-white"
          :classes="isRWAMarket ? 'border-dashed border-b cursor-pointer' : ''"
          tooltip-class="text-xs"
          :ui="{
            base: 'translate-y-4'
          }"
        >
          <span :data-cy="dataCyTag(MarketCyTags.MarketTicker)">
            {{ market.ticker }}
          </span>
        </CommonHeaderTooltip>

        <div
          v-if="isMarketsPage"
          class="text-xs font-normal text-coolGray-500"
          :data-cy="`${dataCyTag(MarketCyTags.MarketBaseToken)}-${
            market.baseToken.name
          }`"
        >
          {{ market.baseToken.name }}
        </div>
      </div>
    </div>

    <div
      class="flex justify-end flex-[2] lg:flex-[1] truncate min-w-0 font-mono text-xs text-right"
    >
      <AppAmount
        :data-cy="dataCyTag(MarketCyTags.MarketLastPrice)"
        v-bind="{
          amount: lastPriceToFixed
        }"
      />
    </div>

    <div
      :class="priceChangeClasses"
      class="flex items-center flex-[2] truncate min-w-0 font-mono text-xs justify-end"
      :data-cy="dataCyTag(MarketCyTags.MarketPriceChange)"
    >
      {{ summary.change }}%
    </div>

    <div
      class="flex items-center justify-end flex-[2] truncate min-w-0 font-mono text-xs"
    >
      <span v-if="isMobile || !isMarketsPage">
        <span>$</span>
        <span v-if="abbreviateNumber(volumeToFixed)">
          {{ abbreviateNumber(volumeToFixed) }}
        </span>
        <span v-else>
          <AppUsdAmount
            v-bind="{ amount: volumeToFixed, isShowNoDecimals: true }"
          />
        </span>
      </span>
      <span v-else :data-cy="dataCyTag(MarketCyTags.MarketVolume)">
        <span>$</span>
        <AppUsdAmount
          v-bind="{ amount: volumeToFixed, isShowNoDecimals: true }"
        />
      </span>
    </div>

    <div
      v-if="isMarketsPage"
      class="flex-[2] flex items-center p-2 space-x-8 justify-end"
    >
      <NuxtLink
        class="text-blue-500 hover:text-blue-600"
        :data-cy="`${dataCyTag(MarketCyTags.MarketTrade)}-${market.marketId}`"
      >
        {{ $t('trade.trade') }}
      </NuxtLink>

      <div
        :class="{
          '!text-blue-500': appStore.favoriteMarkets.includes(market.marketId)
        }"
        class="pr-2 w-8 text-coolGray-700 hover:text-blue-700"
        @click.stop.prevent="toggleFavorite"
      >
        <UIcon :name="NuxtUiIcons.Star" class="h-6 w-6 min-w-6" />
      </div>
    </div>
  </PartialsCommonMarketRedirection>
</template>
