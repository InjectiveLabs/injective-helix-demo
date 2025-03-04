<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { marketCategoriesMap } from '@/app/json'
import { MarketCategoryType } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()
const { sm } = useSharedBreakpoints()

withDefaults(
  defineProps<{
    marketPriceMap: Record<string, BigNumberInBase>
  }>(),
  {}
)

// todo: remove after iAssets category is live
const filteredMarketCategoriesWithMarkets = Object.values(
  MarketCategoryType
).filter(
  (category) =>
    category !== MarketCategoryType.iAssets ||
    Object.keys(marketCategoriesMap.iAssets).length > 0
)

const activeCategoryOptions = filteredMarketCategoriesWithMarkets.map(
  (value) => ({
    label: t(`markets.filters.${value}`),
    value
  })
)

const search = ref('')
const isLowVolumeMarketsVisible = ref(false)
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

function resetCategory() {
  if (activeCategory.value === MarketCategoryType.All) {
    return
  }

  activeCategory.value = MarketCategoryType.All
}
</script>

<template>
  <div class="relative">
    <div class="z-10 sticky top-0 bg-brand-900 border-b">
      <div class="p-2 space-y-2">
        <div class="sm:border-b sm:py-2">
          <label class="flex rounded p-1">
            <div class="flex items-center text-coolGray-500">
              <UIcon :name="NuxtUiIcons.Search" class="h-6 w-6 min-w-6" />
            </div>
            <input
              id="search-market"
              v-model="search"
              v-focus
              :placeholder="$t('trade.search_market')"
              type="text"
              class="p-1 focus:outline-none placeholder:text-coolGray-600 flex-1 !bg-transparent"
              autocomplete="off"
              @update:model-value="resetCategory"
            />
          </label>
        </div>

        <div
          v-if="sm"
          class="flex max-md:flex-col max-md:items-start gap-2 justify-between"
        >
          <div class="sm:flex gap-2 flex-wrap justify-between max-sm:w-full">
            <template v-if="sm">
              <AppButtonSelect
                v-for="category in activeCategoryOptions"
                :key="category.value"
                v-model="activeCategory"
                v-bind="{ value: category.value }"
              >
                <template #default="{ isActive }">
                  <AppButton
                    variant="primary"
                    size="xs"
                    :class="[
                      'bg-opacity-20 text-blue-550 border-0 tracking-wider capitalize font-semibold focus-within:ring-0 rounded-md hover:bg-opacity-20 hover:bg-blue-500',
                      isActive ? 'opacity-100' : 'opacity-50'
                    ]"
                  >
                    {{ $t(`markets.filters.${category.value}`) }}
                  </AppButton>
                </template>
              </AppButtonSelect>
              <div class="flex-grow"></div>
            </template>
          </div>

          <AppCheckbox2 v-model="isLowVolumeMarketsVisible" no-wrap>
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
