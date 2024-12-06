<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { NuxtUiIcons } from '@shared/types'
import { marketTypeOptionsToHideCategory } from '@/app/data/market'
import { MarketQuoteType, MarketTypeOption, MarketCategoryType } from '@/types'

const spotStore = useSpotStore()
const { sm } = useTwBreakpoints()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()

withDefaults(
  defineProps<{
    marketPriceMap: Record<string, BigNumberInBase>
  }>(),
  {}
)

const activeTypeOptions = Object.values(MarketTypeOption)
  .filter(
    (marketType) =>
      ![MarketTypeOption.Permissionless /* MarketTypeOption.Themes */].includes(
        marketType
      )
  )
  .map((value) => ({
    label: `markets.${value}`,
    value
  }))

const activeCategoryOptions = Object.values(MarketCategoryType).map(
  (value) => ({ label: `markets.${value}`, value })
)

const mobileMarketTypeOption = Object.values(MarketTypeOption).map((value) => ({
  label: value,
  value
}))

const mobileMarketCategoryType = Object.entries(MarketCategoryType).map(
  ([key, value]) => ({ label: key, value })
)

const search = ref('')
const isLowVolumeMarketsVisible = ref(false)
const activeQuote = ref(MarketQuoteType.All)
const activeType = ref(MarketTypeOption.All)
const activeCategory = ref(MarketCategoryType.All)

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [...spotStore.marketsWithSummary, ...derivativeStore.marketsWithSummary].map(
    ({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPrice(market.quoteToken)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    }
  )
)
</script>

<template>
  <div class="relative">
    <div class="z-10 sticky top-0 bg-brand-900 border-b">
      <div class="p-2 space-y-2">
        <div class="border-b py-2">
          <label class="flex rounded p-1">
            <div class="flex items-center text-coolGray-500">
              <UIcon :name="NuxtUiIcons.Search" class="h-6 w-6 min-w-6" />
            </div>
            <input
              id="search-market"
              v-model="search"
              v-focus
              placeholder="Search Market..."
              type="text"
              class="p-1 focus:outline-none placeholder:text-coolGray-600 flex-1 !bg-transparent"
              autocomplete="off"
            />
          </label>
        </div>

        <div
          class="flex max-md:flex-col max-md:items-start gap-2 justify-between"
        >
          <div v-if="sm" class="flex gap-2 flex-wrap">
            <AppButtonSelect
              v-for="category in activeTypeOptions"
              :key="category.value"
              v-model="activeType"
              v-bind="{ value: category.value }"
              class="text-xs bg-blue-500 bg-opacity-20 opacity-50 py-1 px-2 tracking-wider capitalize font-semibold rounded-md text-blue-550"
              active-classes="opacity-100"
            >
              {{ category.value }}
            </AppButtonSelect>
          </div>
          <div v-else class="w-full">
            <p class="text-xs text-gray-500 mb-2">
              {{ $t('common.marketType') }}
            </p>
            <USelectMenu
              v-model="activeType"
              value-attribute="value"
              :options="mobileMarketTypeOption"
              :ui-menu="{
                select: 'capitalize',
                option: { base: 'capitalize' }
              }"
            />
          </div>

          <div class="flex overflow-hidden rounded border">
            <AppButtonSelect
              v-for="value in Object.values(MarketQuoteType)"
              :key="value"
              v-model="activeQuote"
              v-bind="{ value }"
              class="py-1 px-3 text-coolGray-400 text-xs uppercase hover:bg-brand-875"
              active-classes="text-white !bg-brand-800"
            >
              {{ value }}
            </AppButtonSelect>
          </div>
        </div>

        <div
          class="flex justify-between sm:items-center flex-wrap max-sm:flex-col"
        >
          <div
            v-if="!marketTypeOptionsToHideCategory.includes(activeType)"
            class="sm:flex gap-2 flex-wrap justify-between max-sm:w-full"
          >
            <template v-if="sm">
              <AppButtonSelect
                v-for="category in activeCategoryOptions"
                :key="category.value"
                v-model="activeCategory"
                v-bind="{ value: category.value }"
                class="text-xs bg-blue-500 bg-opacity-20 opacity-50 py-1 px-2 tracking-wider capitalize font-semibold rounded-md text-blue-550"
                active-classes="opacity-100"
              >
                {{ category.value }}
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

          <AppCheckbox2 v-model="isLowVolumeMarketsVisible">
            {{ $t('markets.showLowVol') }}
          </AppCheckbox2>
        </div>
      </div>
    </div>

    <div class="divide-y overflow-x-auto">
      <div class="lg:min-w-[600px] max-lg:px-2">
        <CommonHeadlessMarkets
          v-bind="{
            search,
            activeType,
            activeQuote,
            activeCategory,
            isLowVolumeMarketsVisible,
            markets: marketsWithSummaryAndVolumeInUsd
          }"
        >
          <template #default="{ sortedMarkets }">
            <PartialsTradeStatsMarketSelectorTable
              v-bind="{ sortedMarkets, marketPriceMap }"
            />
          </template>
        </CommonHeadlessMarkets>
      </div>
    </div>
  </div>
</template>
