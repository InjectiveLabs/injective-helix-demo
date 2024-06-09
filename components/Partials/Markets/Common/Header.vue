<script setup lang="ts">
import { MarketHeaderType } from '@/types'

defineProps({
  isAscending: Boolean,
  isMarketsPage: Boolean,

  sortBy: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'update:isAscending': [value: boolean]
  'update:sortBy': [value: MarketHeaderType]
}>()

function handleSortBy(value: string) {
  emit('update:sortBy', value as MarketHeaderType)
}

function handleIsAscending(value: boolean) {
  emit('update:isAscending', value)
}
</script>

<template>
  <div class="flex border-b p-4 text-gray-500 text-xs select-none">
    <div class="flex-4 md:flex-3 flex min-w-0 truncate">
      <BaseSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Market
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex items-center space-x-2 cursor-pointer">
            <div class="font-normal">
              {{ $t('trade.markets') }}
            </div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>

    <div class="flex-2 lg:flex-1 min-w-0 truncate text-right">
      <div>
        {{ $t('trade.lastPrice') }}
      </div>
    </div>

    <div class="flex-2 min-w-0 truncate flex justify-end">
      <BaseSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Change
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex font-normal items-center space-x-2 cursor-pointer">
            <div>{{ $t('markets.change24h') }}</div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>

    <div class="flex-2 min-w-0 truncate flex justify-end">
      <BaseSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Volume
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex items-center space-x-2 cursor-pointer font-normal">
            <div>{{ $t('markets.volume24h') }}</div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>

    <div v-if="isMarketsPage" class="flex-2"></div>
  </div>
</template>
