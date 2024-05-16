<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  marketIsActive,
  marketIsQuotePair,
  marketIsPartOfType,
  marketIsPartOfSearch,
  marketIsPartOfCategory
} from '@/app/utils/market'
import { LOW_VOLUME_MARKET_THRESHOLD } from '@/app/utils/constants'
import {
  MarketQuoteType,
  MarketTypeOption,
  MarketCategoryType,
  unknownTokenStatusKey
} from '@/types'

const marketTypeOptionsToHideCategory = [
  MarketTypeOption.Themes,
  MarketTypeOption.NewListings,
  MarketTypeOption.Permissionless
]

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const search = ref('')
const type = ref(MarketTypeOption.All)
const category = ref(MarketCategoryType.All)
const activeQuote = ref(MarketQuoteType.All)
const isLowVolumeMarketsVisible = ref(false)
const permissionlessStatus = reactive(new Status(StatusType.Idle))

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [
    ...spotStore.marketsWithSummary,
    ...derivativeStore.marketsWithSummary,
    ...exchangeStore.upcomingMarketsWithSummary,
    ...exchangeStore.deprecatedMarketsWithSummary
  ].map(({ market, summary }) => {
    const quoteTokenUsdPrice = new BigNumberInBase(
      tokenStore.tokenUsdPrice(market.quoteToken)
    )

    return {
      market,
      summary,
      volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
    }
  })
)

const filteredMarkets = computed(() =>
  marketsWithSummaryAndVolumeInUsd.value
    .filter(({ market, volumeInUsd }) => {
      const shouldIgnoreCategory = marketTypeOptionsToHideCategory.includes(
        type.value
      )

      const isPartOfCategory =
        shouldIgnoreCategory || marketIsPartOfCategory(category.value, market)
      const isPartOfSearch = marketIsPartOfSearch(search.value, market)
      const isPartOfType = marketIsPartOfType({
        market,
        favoriteMarkets: appStore.favoriteMarkets,
        activeType: type.value
      })
      const isQuotePair = marketIsQuotePair(activeQuote.value, market)

      const isLowVolumeMarket =
        isLowVolumeMarketsVisible.value ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return (
        isLowVolumeMarket &&
        isPartOfCategory &&
        isPartOfType &&
        isPartOfSearch &&
        isQuotePair
      )
    })
    .filter((market) => marketIsActive(market.market))
)

onMounted(() => getQuoteTokenPrice())

function getQuoteTokenPrice() {
  Promise.all([appStore.pollMarkets()]).catch($onError)
}

async function onMarketTypeChange(type: string) {
  if ((type as MarketTypeOption) !== MarketTypeOption.Permissionless) {
    return
  }

  permissionlessStatus.setLoading()

  await until(unknownTokenStatus).toMatch((status) => status.isIdle())

  spotStore
    .fetchMarkets()
    .catch($onError)
    .finally(() => permissionlessStatus.setIdle())
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)

const unknownTokenStatus = inject(
  unknownTokenStatusKey,
  new Status(StatusType.Loading)
)
</script>

<template>
  <div>
    <div class="container py-10">
      <h3 class="text-2xl font-semibold">{{ $t('trade.markets') }}</h3>
      <PartialsMarketsNewMarkets
        v-bind="{ markets: marketsWithSummaryAndVolumeInUsd }"
        class="my-10"
      />

      <div
        class="border-b border-brand-700 my-4 flex justify-between items-end"
      >
        <div class="flex">
          <AppButtonSelect
            v-for="value in Object.values(MarketTypeOption)"
            :key="value"
            v-model="type"
            v-bind="{ value }"
            class="capitalize text-gray-200 px-4 py-2 text-sm border-b font-medium"
            active-classes="border-blue-500 !text-blue-500"
            @update:model-value="onMarketTypeChange"
          >
            {{ value }}
          </AppButtonSelect>
        </div>

        <div class="flex py-2">
          <label
            class="flex items-center border border-transparent focus-within:border-brand-850 rounded-md p-1"
          >
            <input
              v-model="search"
              type="text"
              class="focus:outline-none bg-transparent p-1 px-3"
            />

            <div class="flex items-center pr-3">
              <BaseIcon name="search" class="text-gray-500" />
            </div>
          </label>
        </div>
      </div>

      <div class="my-4 flex space-x-2 justify-between">
        <div
          v-if="!marketTypeOptionsToHideCategory.includes(type)"
          class="flex space-x-2"
        >
          <AppButtonSelect
            v-for="value in Object.values(MarketCategoryType)"
            :key="value"
            v-model="category"
            v-bind="{ value }"
            class="py-1 px-3 text-gray-400 text-xs capitalize bg-brand-800 rounded"
            active-classes="text-white !bg-brand-700"
          >
            {{ value }}
          </AppButtonSelect>
        </div>

        <div v-else></div>

        <div class="flex items-center space-x-3">
          <div class="flex overflow-hidden rounded border">
            <AppButtonSelect
              v-for="value in Object.values(MarketQuoteType)"
              :key="value"
              v-model="activeQuote"
              v-bind="{ value }"
              class="py-1 px-3 text-gray-400 text-xs uppercase hover:bg-brand-875"
              active-classes="text-white !bg-brand-800"
            >
              {{ value }}
            </AppButtonSelect>
          </div>

          <AppCheckbox2 v-model="isLowVolumeMarketsVisible" class="ml-4" is-sm>
            {{ $t('markets.showLowVol') }}
          </AppCheckbox2>
        </div>
      </div>

      <div
        v-if="type === MarketTypeOption.Permissionless"
        class="flex space-x-4 py-4 text-gray-500"
      >
        <SharedIcon name="warning-triangle" />
        <span>{{ $t('markets.permisionlessWarning') }}</span>
      </div>

      <!-- <div class="border border-brand-700 rounded-lg overflow-hidden"> -->
      <PartialsMarkets
        v-if="type !== MarketTypeOption.Themes"
        is-markets-page
        v-bind="{
          markets: filteredMarkets,
          isLoading: permissionlessStatus.isLoading()
        }"
      />

      <PartialsMarketsThemes v-else v-bind="{ markets: filteredMarkets }" />
    </div>
  </div>
</template>
