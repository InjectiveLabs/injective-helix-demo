<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketCyTags, MarketCategoryType } from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()
const { sm } = useSharedBreakpoints()

const search = ref('')
const activeCategory = ref(setCategoryFromQuery())
const isLowVolumeMarketsVisible = ref(false)

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [...spotStore.marketsWithSummary, ...derivativeStore.marketsWithSummary]
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
        <div
          class="flex sm:gap-4 lg:gap-2 justify-between flex-wrap max-sm:flex-col"
        >
          <div
            class="sm:flex max-sm:w-full items-center flex-wrap gap-2"
            :data-cy="dataCyTag(MarketCyTags.MarketsCategoryType)"
          >
            <template v-if="sm">
              <AppButtonSelect
                v-for="value in Object.values(MarketCategoryType)"
                :key="value"
                v-model="activeCategory"
                v-bind="{ value }"
                :data-cy="`${dataCyTag(MarketCyTags.MarketChain)}-${value}`"
                @update:model-value="resetSearch"
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
                    {{ $t(`markets.filters.${value}`) }}
                  </AppButton>
                </template>
              </AppButtonSelect>
            </template>
          </div>

          <div class="flex justify-between max-xl:w-full">
            <label
              class="flex items-center border-b border-[#181E31] rounded-md p-1 max-sm:w-full max-xs:flex-1"
            >
              <input
                v-model="search"
                type="text"
                class="focus:outline-none bg-transparent p-1 px-3 w-full text-sm"
                :data-cy="dataCyTag(MarketCyTags.MarketSearch)"
                :placeholder="$t('trade.search_market')"
                @update:model-value="resetCategory"
              />

              <div class="flex items-center pr-3">
                <UIcon
                  :name="NuxtUiIcons.Search"
                  class="size-5 text-coolGray-450"
                />
              </div>
            </label>

            <div class="flex max-sm:hidden">
              <AppCheckbox2
                v-model="isLowVolumeMarketsVisible"
                class="text-coolGray-450"
                is-sm
              >
                {{ $t('markets.showLowVol') }}
              </AppCheckbox2>
            </div>
          </div>
        </div>
      </div>

      <PartialsMarkets
        v-bind="{
          search,
          activeCategory,
          isLowVolumeMarketsVisible,
          markets: marketsWithSummaryAndVolumeInUsd
        }"
      />
    </div>
  </div>
</template>
