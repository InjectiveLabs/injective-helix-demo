<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { MarketCyTags } from '@/enums'
import {
  MarketQuoteType,
  MarketTypeOption,
  MarketCategoryType,
  UnknownTokenStatusKey
} from '@/types'
import { marketTypeOptionsToHideCategory } from '@/app/data/market'

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const search = ref('')
const activeType = ref(MarketTypeOption.All)
const activeCategory = ref(MarketCategoryType.All)
const activeQuote = ref(MarketQuoteType.All)
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

async function onMarketTypeChange(type: string) {
  if ((type as MarketTypeOption) !== MarketTypeOption.Permissionless) {
    return
  }

  unverifiedMarketsStatus.setLoading()

  await until(unknownTokenStatus).toMatch((status) => status.isIdle())

  spotStore
    .fetchMarkets()
    .catch($onError)
    .finally(() => unverifiedMarketsStatus.setIdle())
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)

const unknownTokenStatus = inject(
  UnknownTokenStatusKey,
  new Status(StatusType.Loading)
)
</script>

<template>
  <div>
    <div class="container py-10">
      <h3
        class="text-2xl font-semibold"
        :data-cy="dataCyTag(MarketCyTags.HeaderLabel)"
      >
        {{ $t('trade.markets') }}
      </h3>

      <PartialsMarketsOverview
        v-bind="{ markets: marketsWithSummaryAndVolumeInUsd }"
        class="my-10"
      />

      <div class="max-w-full">
        <div
          class="border-b border-brand-700 my-4 flex justify-between items-end flex-wrap"
        >
          <div class="flex overflow-x-auto">
            <AppButtonSelect
              v-for="value in Object.values(MarketTypeOption)"
              :key="value"
              v-model="activeType"
              v-bind="{ value }"
              class="capitalize text-gray-200 px-4 py-2 text-sm border-b font-medium whitespace-nowrap"
              active-classes="border-blue-500 !text-blue-500"
              :data-cy="`${dataCyTag(MarketCyTags.MarketType)}-${value}`"
              @update:model-value="onMarketTypeChange"
            >
              {{ value }}
            </AppButtonSelect>
          </div>

          <div class="flex max-lg:w-full">
            <label
              class="w-full flex items-center border border-transparent focus-within:border-brand-850 rounded-md p-1"
            >
              <input
                v-model="search"
                type="text"
                class="focus:outline-none bg-transparent p-1 px-3 w-full"
                :data-cy="dataCyTag(MarketCyTags.MarketSearch)"
              />

              <div class="flex items-center pr-3">
                <SharedIcon name="search" class="text-gray-500" />
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto max-w-full">
        <div class="my-4 flex gap-x-2 justify-between flex-wrap">
          <div
            v-if="!marketTypeOptionsToHideCategory.includes(activeType)"
            class="flex space-x-2"
          >
            <AppButtonSelect
              v-for="value in Object.values(MarketCategoryType)"
              :key="value"
              v-model="activeCategory"
              v-bind="{ value }"
              class="py-1 px-3 text-gray-400 text-xs capitalize bg-brand-800 rounded"
              active-classes="text-white !bg-brand-700"
              :data-cy="`${dataCyTag(MarketCyTags.MarketChain)}-${value}`"
            >
              {{ value }}
            </AppButtonSelect>
          </div>
          <div v-else />

          <div
            v-if="activeType === MarketTypeOption.Permissionless"
            class="flex items-center gap-x-2 text-gray-500"
          >
            <SharedIcon name="warning-triangle" is-md />
            <span class="text-sm">{{
              $t('markets.permisionlessWarning')
            }}</span>
          </div>

          <div class="flex gap-x-3 mt-2 lg:mt-0 flex-wrap">
            <div class="flex rounded border">
              <AppButtonSelect
                v-for="value in Object.values(MarketQuoteType)"
                :key="value"
                v-model="activeQuote"
                v-bind="{ value }"
                class="py-1 px-3 text-gray-400 text-xs uppercase hover:bg-brand-875"
                active-classes="text-white !bg-brand-800"
                :data-cy="`${dataCyTag(
                  MarketCyTags.MarketQuoteToken
                )}-${value}`"
              >
                {{ value }}
              </AppButtonSelect>
            </div>

            <AppCheckbox2
              v-model="isLowVolumeMarketsVisible"
              class="md:ml-4 flex items-center"
              is-sm
            >
              {{ $t('markets.showLowVol') }}
            </AppCheckbox2>
          </div>
        </div>
      </div>

      <PartialsMarkets
        is-markets-page
        v-bind="{
          search,
          activeType,
          activeQuote,
          activeCategory,
          isLowVolumeMarketsVisible,
          markets: marketsWithSummaryAndVolumeInUsd,
          isLoading: unverifiedMarketsStatus.isLoading()
        }"
      />

      <!--
      <PartialsMarkets
        v-if="type !== MarketTypeOption.Themes"
        is-markets-page
        v-bind="{
          markets: filteredMarkets,
          isLoading: unverifiedMarketsStatus.isLoading()
        }"
      />

      <PartialsMarketsThemes v-else v-bind="{ markets: filteredMarkets }" />
      -->
    </div>
  </div>
</template>
