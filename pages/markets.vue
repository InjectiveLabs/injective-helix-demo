<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { INJ_COIN_GECKO_ID } from '@injectivelabs/sdk-ui-ts'
import {
  LOW_VOLUME_MARKET_THRESHOLD,
  QUOTE_DENOMS_GECKO_IDS
} from '@/app/utils/constants'
import { MarketTypeOption, MarketCategoryType, MarketQuoteType } from '@/types'
import {
  marketIsActive,
  marketIsPartOfCategory,
  marketIsPartOfSearch,
  marketIsPartOfType,
  marketIsQuotePair
} from '~/app/utils/market'
import { olpSlugsToIncludeInLowVolume } from '~/app/data/market'

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

const favoriteMarkets = computed(() => appStore.favoriteMarkets)

const marketsWithSummariesLoaded = computed(
  () =>
    spotStore.marketsWithSummary.some(({ summary }) => summary) &&
    derivativeStore.marketsWithSummary.some(({ summary }) => summary)
)

const filteredMarkets = computed(() =>
  marketsWithSummaryAndVolumeInUsd.value
    .filter(({ market, volumeInUsd }) => {
      const isPartOfCategory = marketIsPartOfCategory(category.value, market)
      const isPartOfSearch = marketIsPartOfSearch(search.value, market)
      const isPartOfType = marketIsPartOfType({
        market,
        favoriteMarkets: favoriteMarkets.value,
        activeType: type.value
      })
      const isQuotePair = marketIsQuotePair(activeQuote.value, market)
      const isOLPMarket = olpSlugsToIncludeInLowVolume.includes(market.slug)
      const isLowVolumeMarket =
        isLowVolumeMarketsVisible.value ||
        volumeInUsd.gte(LOW_VOLUME_MARKET_THRESHOLD)

      return (
        isPartOfCategory &&
        isPartOfType &&
        isPartOfSearch &&
        isQuotePair &&
        (isLowVolumeMarket || isOLPMarket || search.value)
      )
    })
    .filter((market) => marketIsActive(market.market))
)

onMounted(() => getQuoteTokenPrice())

function getQuoteTokenPrice() {
  Promise.all([
    appStore.pollMarkets(),
    tokenStore.fetchTokensUsdPriceMap([
      ...QUOTE_DENOMS_GECKO_IDS,
      INJ_COIN_GECKO_ID
    ])
  ]).catch($onError)
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)
</script>

<template>
  <div>
    <AppHocLoading :is-loading="!marketsWithSummariesLoaded">
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

        <div class="my-4 flex space-x-2">
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

        <!-- <div class="border border-brand-700 rounded-lg overflow-hidden"> -->
        <PartialsMarkets
          v-if="type !== MarketTypeOption.Themes"
          is-markets-page
          v-bind="{ markets: filteredMarkets }"
        />

        <PartialsMarketsThemes v-else v-bind="{ markets: filteredMarkets }" />
        <!-- </div> -->
      </div>
    </AppHocLoading>
  </div>
</template>
