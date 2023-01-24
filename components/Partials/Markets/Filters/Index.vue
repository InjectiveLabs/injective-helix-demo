<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { MarketCategoryType, MarketQuoteType } from '@/types'

const props = defineProps({
  activeCategory: {
    type: String as PropType<MarketCategoryType>,
    required: true
  },

  activeQuote: {
    type: String as PropType<MarketQuoteType>,
    required: true
  },

  activeType: {
    type: String,
    required: true
  },

  search: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:activeCategory', state: MarketCategoryType): void
  (e: 'update:search', state: string): void
  (e: 'update:activeQuote', state: MarketQuoteType): void
  (e: 'update:activeType', state: string): void
}>()

const route = useRoute()
const router = useRouter()

const marketCategoryTypes = ref(getMarketCategoryTypes())
const quoteOptions = ref(
  Object.entries(MarketQuoteType)
    .map(([key, value]) => {
      return {
        label: key,
        value
      }
    })
    .map((quoteOption) => ({
      display: quoteOption.label,
      value: quoteOption.value
    }))
)

const activeQuoteValue = computed({
  get(): MarketQuoteType {
    return props.activeQuote
  },
  set(value: MarketQuoteType) {
    emit('update:activeQuote', value)
  }
})

function getMarketCategoryTypes() {
  return Object.entries(MarketCategoryType).map(([key, value]) => {
    return {
      key: `market-category-type-${value}`,
      label: key,
      type: MarketCategoryType[key as keyof typeof MarketCategoryType]
    }
  })
}

function handleCategoryChange(category: string) {
  emit('update:activeCategory', category as MarketCategoryType)

  if (category === props.activeCategory) {
    return
  }

  if (!category || category === MarketCategoryType.All) {
    clearRouteQueryParam('category')
  } else {
    fillRouteQueryParams({ category })
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
    fillRouteQueryParams({ quote })
  }
}

function handleTypeClick(type: string) {
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
    <AppTabMenu>
      <template #items>
        <AppTabMenuItem
          :value="MarketType.Favorite"
          :active="activeType === MarketType.Favorite"
          data-cy="markets-favorites-selector"
          @click="handleTypeClick"
        >
          <span class="flex items-center">
            <BaseIcon name="star-border" class="mr-1" />
            <span>{{ $t('trade.favorites') }}</span>
          </span>
        </AppTabMenuItem>

        <AppTabMenuItem
          :value="''"
          :active="activeType === ''"
          data-cy="markets-all-markets-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.allMarkets') }}
        </AppTabMenuItem>

        <AppTabMenuItem
          :value="MarketType.Spot"
          :active="activeType === MarketType.Spot"
          data-cy="markets-spot-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.spots') }}
        </AppTabMenuItem>

        <AppTabMenuItem
          :value="MarketType.Derivative"
          :active="activeType === MarketType.Derivative"
          data-cy="markets-perpetual-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.futures') }}
        </AppTabMenuItem>
      </template>

      <template #actions>
        <AppSearch
          name="search"
          class="sm:w-auto md:w-3xs"
          input-classes="placeholder-white"
          dense
          transparent-bg
          data-cy="markets-search-input"
          :placeholder="$t('trade.search_markets')"
          show-prefix
          :model-value="search"
          @update:modelValue="handleSearchedEvent"
        />
      </template>
    </AppTabMenu>

    <div class="flex items-center justify-between mt-6 mb-2">
      <div class="flex items-center gap-2">
        <PartialsMarketsFiltersCategorySelector
          v-for="marketCategoryType in marketCategoryTypes"
          :key="marketCategoryType.key"
          :type="marketCategoryType.type"
          :active="activeCategory === marketCategoryType.type"
          :data-cy="`market-category-${marketCategoryType.key}-button`"
          @click="handleCategoryChange"
        >
          {{ marketCategoryType.label }}
        </PartialsMarketsFiltersCategorySelector>
      </div>

      <AppSelect
        v-model="activeQuoteValue"
        :options="quoteOptions"
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
    </div>
  </div>
</template>
