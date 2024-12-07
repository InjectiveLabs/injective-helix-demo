<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { MarketCyTags, MarketCategoryType } from '@/types'

const route = useRoute()
const appStore = useAppStore()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()
const { sm } = useTwBreakpoints()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()

const mobileMarketCategoryType = Object.entries(MarketCategoryType).map(
  ([key, value]) => ({ label: key, value })
)

const search = ref('')
const activeCategory = ref(setCategoryFromQuery())
const isLowVolumeMarketsVisible = ref(false)
const unverifiedMarketsStatus = reactive(new Status(StatusType.Idle))

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [
    ...spotStore.marketsWithSummary,
    ...derivativeStore.marketsWithSummary,
    ...exchangeStore.upcomingMarketsWithSummary,
    ...exchangeStore.deprecatedMarketsWithSummary
  ]
    .map(({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    })
    .filter(({ summary }) => summary)
)

onMounted(() => {
  getQuoteTokenPrice()
})

function getQuoteTokenPrice() {
  Promise.all([appStore.pollMarkets()]).catch($onError)
}

function setCategoryFromQuery() {
  if (
    Object.values(MarketCategoryType).includes(
      route.query.type as MarketCategoryType
    )
  ) {
    return route.query.type as MarketCategoryType
  }

  return MarketCategoryType.All
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl pt-16 pb-10 px-4 max-lg:pt-8">
      <h3
        class="text-3xl font-semibold"
        :data-cy="dataCyTag(MarketCyTags.HeaderLabel)"
      >
        {{ $t('trade.markets') }}
      </h3>

      <PartialsMarketsOverview
        v-bind="{ markets: marketsWithSummaryAndVolumeInUsd }"
        class="mt-8"
      />

      <div class="max-w-full mt-4 lg:mb-2">
        <div class="flex gap-2 justify-between flex-wrap max-sm:flex-col">
          <div class="sm:flex max-sm:w-full items-center flex-wrap gap-2">
            <template v-if="sm">
              <AppButtonSelect
                v-for="value in Object.values(MarketCategoryType)"
                :key="value"
                v-model="activeCategory"
                v-bind="{ value }"
                class="text-xs bg-blue-500 bg-opacity-20 opacity-50 py-1 px-2 tracking-wider capitalize rounded text-blue-550"
                active-classes="opacity-100"
                :data-cy="`${dataCyTag(MarketCyTags.MarketChain)}-${value}`"
              >
                {{ $t(`markets.filters.${value}`) }}
              </AppButtonSelect>
            </template>

            <div v-else>
              <p class="text-xs text-gray-500 mb-2">
                {{ $t('common.marketCategory') }}
              </p>
              <USelectMenu
                v-model="activeCategory"
                value-attribute="value"
                :options="mobileMarketCategoryType"
              />
            </div>
          </div>

          <div class="flex justify-between max-xl:w-full">
            <label
              class="flex items-center border border-transparent rounded-md p-1 max-xs:w-full"
            >
              <input
                v-model="search"
                type="text"
                class="focus:outline-none bg-transparent p-1 px-3 w-full"
                :data-cy="dataCyTag(MarketCyTags.MarketSearch)"
              />

              <div class="flex items-center pr-3">
                <UIcon
                  :name="NuxtUiIcons.Search"
                  class="size-5 text-coolGray-450"
                />
              </div>
            </label>

            <div class="flex">
              <AppCheckbox2
                v-model="isLowVolumeMarketsVisible"
                class="text-coolGray-450"
                is-sm
              >
                {{ $t('markets.showLowVol') }}
              </AppCheckbox2>
            </div>
          </div>

          <div
            v-if="activeCategory === MarketCategoryType.Experimental"
            class="flex items-center gap-x-2 text-coolGray-500"
          >
            <UIcon :name="NuxtUiIcons.WarningOutline" class="w-5 h-5 min-w-5" />
            <span class="text-sm">{{
              $t('markets.permisionlessWarning')
            }}</span>
          </div>
        </div>
      </div>

      <PartialsMarkets
        v-bind="{
          search,
          activeQuote,
          activeCategory,
          isLowVolumeMarketsVisible,
          markets: marketsWithSummaryAndVolumeInUsd,
          isLoading: unverifiedMarketsStatus.isLoading()
        }"
      />
    </div>
  </div>
</template>
