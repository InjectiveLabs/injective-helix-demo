<script setup lang="ts">
import { MarketHeaderType } from '@/types'

defineProps({
  isAscending: Boolean,

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
  <div class="flex bg-brand-825 border-y p-4 text-gray-500 text-xs select-none">
    <div class="flex-[2] flex min-w-0 truncate">
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
          <div class="pl-6 flex items-center space-x-2 cursor-pointer">
            <div>
              {{ $t('trade.markets') }}
            </div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>

    <div class="flex-1 min-w-0 truncate">
      <BaseSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Price
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex items-center space-x-2 cursor-pointer">
            <div>
              {{ $t('trade.price') }}
            </div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>

    <div class="flex-1 min-w-0 truncate">
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
          <div class="flex items-center space-x-2 cursor-pointer">
            <div>24h Change</div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>

    <div class="flex-1 min-w-0 truncate">
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
          <div class="flex items-center space-x-2 cursor-pointer">
            <div>{{ $t('trade.volumeUsd') }}</div>
            <div :class="{ 'rotate-180': isActive && isAscending }">
              <SharedIcon is-sm name="triangle" />
            </div>
          </div>
        </template>
      </BaseSortableHeaderItem>
    </div>
  </div>
</template>
