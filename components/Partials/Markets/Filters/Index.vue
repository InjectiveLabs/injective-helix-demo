<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { MarketCategoryType, MarketQuoteType } from '@/types'

const route = useRoute()
const router = useRouter()

const props = withDefaults(
  defineProps<{
    isLowVolumeMarketsVisible?: boolean
    search: string
    activeType: string
    activeQuote: MarketQuoteType
    activeCategory: MarketCategoryType
  }>(),
  {
    isLowVolumeMarketsVisible: false
  }
)

const emit = defineEmits<{
  'update:search': [state: string]
  'update:activeType': [state: string]
  'update:activeQuote': [state: MarketQuoteType]
  'update:isLowVolumeMarketsVisible': [state: boolean]
  'update:activeCategory': [state: MarketCategoryType]
}>()

const FilterList = {
  [SharedMarketType.Favorite]: SharedMarketType.Favorite,
  All: '',
  [SharedMarketType.Spot]: SharedMarketType.Spot,
  [SharedMarketType.Derivative]: SharedMarketType.Derivative
}
const marketCategoryTypes = Object.entries(MarketCategoryType).map(
  ([key, value]) => ({
    key: `market-category-type-${value}`,
    label: key,
    type: MarketCategoryType[key as keyof typeof MarketCategoryType]
  })
)
const quoteOptions = Object.entries(MarketQuoteType).map(([key, value]) => ({
  display: key,
  value
}))

const activeQuoteValue = computed({
  get: (): MarketQuoteType => props.activeQuote,
  set: (value: MarketQuoteType) => {
    emit('update:activeQuote', value)
  }
})

const isLowVolumeMarketsVisibleValue = computed({
  get: (): boolean => props.isLowVolumeMarketsVisible,
  set: (type: boolean) => {
    emit('update:isLowVolumeMarketsVisible', type)
  }
})

const activeFilterType = computed({
  get: (): string => props.activeType,
  set: (type: string) => {
    emit('update:activeType', type)

    if (type === props.activeType) {
      return
    }

    if (!type || type === '') {
      clearRouteQueryParam('type')
    } else {
      fillRouteQueryParams({ type: type.toLowerCase() })
    }
  }
})

function handleCategoryChange(category: string) {
  emit('update:activeCategory', category as MarketCategoryType)

  if (category === props.activeCategory) {
    return
  }

  if (!category || category === MarketCategoryType.All) {
    clearRouteQueryParam('category')
  } else {
    fillRouteQueryParams({ category: category.toLowerCase() })
  }
}

function handleSearchedEvent(search: string) {
  emit('update:search', search)
}

function handleQuoteChange(quote: string) {
  if (quote === props.activeQuote) {
    return
  }

  if (!quote || quote === MarketQuoteType.All) {
    clearRouteQueryParam('quote')
  } else {
    fillRouteQueryParams({ quote: quote.toLowerCase() })
  }
}

function clearRouteQueryParam(key: string) {
  const { query } = route
  const queryClone = { ...query }

  delete queryClone[key]

  router.replace({ query: queryClone })
}

function fillRouteQueryParams(params: Record<string, string>) {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      ...params
    }
  })
}
</script>

<template>
  <div>
    <CommonTabMenu>
      <AppSelectButton
        v-for="filterType in Object.values(FilterList)"
        :key="`market-tabs-${filterType}`"
        v-model="activeFilterType"
        :value="filterType"
      >
        <template #default="{ isActive }">
          <CommonTabMenuItem :is-active="isActive">
            <span
              v-if="filterType === FilterList[SharedMarketType.Favorite]"
              class="flex items-center"
            >
              <SharedIcon name="star-border" class="mr-1" />
              <span>{{ $t('trade.favorites') }}</span>
            </span>

            <span v-else-if="filterType === FilterList.All">
              {{ $t('trade.allMarkets') }}
            </span>

            <span v-else-if="filterType === FilterList[SharedMarketType.Spot]">
              {{ $t('trade.spots') }}
            </span>

            <span
              v-else-if="filterType === FilterList[SharedMarketType.Derivative]"
            >
              {{ $t('trade.futures') }}
            </span>
          </CommonTabMenuItem>
        </template>
      </AppSelectButton>

      <template #actions>
        <AppSearch
          name="search"
          class="sm:w-auto md:w-3xs"
          input-classes="placeholder-white"
          is-dense
          is-transparent-bg
          data-cy="markets-search-input"
          :placeholder="$t('trade.search_markets')"
          is-prefix-visible
          :model-value="search"
          @update:modelValue="handleSearchedEvent"
        />
      </template>
    </CommonTabMenu>

    <div
      class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 justify-between mt-6 mb-2 px-3 sm:px-0"
    >
      <div class="flex items-center gap-2">
        <PartialsMarketsFiltersCategorySelector
          v-for="marketCategoryType in marketCategoryTypes"
          :key="marketCategoryType.key"
          :type="marketCategoryType.type"
          :is-active="activeCategory === marketCategoryType.type"
          :data-cy="`market-category-${marketCategoryType.key}-button`"
          @click="handleCategoryChange"
        >
          {{ marketCategoryType.label }}
        </PartialsMarketsFiltersCategorySelector>
      </div>

      <div class="flex items-center">
        <AppSelect
          v-model="activeQuoteValue"
          :options="quoteOptions"
          class="self-end"
          @update:modelValue="handleQuoteChange"
        >
          <template #prefix>
            <span class="text-xs text-gray-300 uppercase">
              {{ $t('markets.quote') }}
            </span>
          </template>

          <template #default="{ selected }">
            <span v-if="selected" class="text-xs text-blue-500 uppercase">
              {{ selected.display }}
            </span>
          </template>

          <template #option="{ option }">
            <span class="text-xs uppercase text-white">
              {{ option.display }}
            </span>
          </template>
        </AppSelect>

        <AppCheckbox
          v-model="isLowVolumeMarketsVisibleValue"
          class="ml-4"
          is-sm
        >
          {{ $t('markets.showLowVol') }}
        </AppCheckbox>
      </div>
    </div>
  </div>
</template>
