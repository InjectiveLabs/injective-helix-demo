<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { IS_MAINNET } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { TradeSubPagePath, MarketCategoryType } from '@/types'

const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const sharedTokenStore = useSharedTokenStore()
const { t } = useLang()
const { sm } = useSharedBreakpoints()

withDefaults(
  defineProps<{
    marketPriceMap: Record<string, BigNumberInBase>
  }>(),
  {}
)

const route = useRoute()

const activeCategoryOptions = computed(() =>
  Object.values(MarketCategoryType).map((value) => ({
    label: t(`markets.filters.${value}`),
    value
  }))
)

const search = ref('')
const isLowVolumeMarketsVisible = ref(!IS_MAINNET)
const activeCategory = ref(MarketCategoryType.All)

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [...spotStore.marketsWithSummary, ...derivativeStore.marketsWithSummary].map(
    ({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        sharedTokenStore.tokenUsdPrice(market.quoteToken)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    }
  )
)

onMounted(() => {
  if (route.query.category) {
    Object.keys(MarketCategoryType).forEach((category) => {
      if (
        category.toLowerCase() ===
        route.query?.category?.toString()?.toLowerCase()
      ) {
        activeCategory.value =
          MarketCategoryType[category as keyof typeof MarketCategoryType]
      }
    })
  }

  if (route.path.startsWith(TradeSubPagePath.Stocks)) {
    activeCategory.value = MarketCategoryType.iAssets
  }
})

function resetSearch() {
  search.value = ''
}

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
              type="text"
              autocomplete="off"
              :placeholder="$t('trade.searchMarket')"
              class="p-1 focus:outline-none placeholder:text-coolGray-600 flex-1 !bg-transparent"
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
                @update:model-value="resetSearch"
              >
                <template #default="{ isActive }">
                  <AppButton
                    variant="primary"
                    size="xs"
                    :class="[
                      isActive ? 'opacity-100' : 'opacity-50',
                      category.value === MarketCategoryType.iAssets
                        ? ''
                        : 'capitalize',
                      'bg-opacity-20 text-blue-550 border-0 tracking-wider font-semibold focus-within:ring-0 rounded-md hover:bg-opacity-20 hover:bg-blue-500'
                    ]"
                  >
                    {{ $t(`markets.filters.${category.value}`) }}
                  </AppButton>
                </template>
              </AppButtonSelect>
              <div class="flex-grow"></div>
            </template>
          </div>

          <AppCheckbox v-model="isLowVolumeMarketsVisible" no-wrap>
            {{ $t('markets.showLowVol') }}
          </AppCheckbox>
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
