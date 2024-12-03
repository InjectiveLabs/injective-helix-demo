<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { MarketHeaderType } from '@/types'

withDefaults(
  defineProps<{
    sortBy: string
    isAscending?: boolean
  }>(),
  {}
)

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
  <div class="flex border-b p-4 text-coolGray-500 text-xs select-none">
    <div class="flex-2 lg:flex-1 flex min-w-0 truncate">
      <SharedSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Market
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex items-center space-x-1 cursor-pointer">
            <div
              class="font-normal"
              :data-cy="dataCyTag(`sortBy-${MarketHeaderType.Market}`)"
            >
              {{ $t('trade.markets') }}
            </div>

            <UIcon
              :name="NuxtUiIcons.Triangle"
              :class="{
                'rotate-180': isActive && isAscending,
                'text-white': isActive
              }"
            />
          </div>
        </template>
      </SharedSortableHeaderItem>
    </div>

    <div
      class="flex-2 lg:flex-1 min-w-0 truncate lg:text-right max-lg:text-center"
    >
      <div>
        {{ $t('trade.lastPrice') }}
      </div>
    </div>

    <div class="flex-1 min-w-0 truncate flex justify-end">
      <SharedSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Change
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex font-normal items-center space-x-1 cursor-pointer">
            <div :data-cy="dataCyTag(`sortBy-${MarketHeaderType.Change}`)">
              {{ $t('markets.change24h') }}
            </div>
            <UIcon
              :name="NuxtUiIcons.Triangle"
              :class="{
                'rotate-180': isActive && isAscending,
                'text-white': isActive
              }"
            />
          </div>
        </template>
      </SharedSortableHeaderItem>
    </div>

    <div
      class="flex-2 lg:flex-1 min-w-0 truncate lg:text-right max-lg:text-center"
    >
      <div>
        {{ $t('trade.estFundingRate') }}
      </div>
    </div>

    <div class="flex-1 min-w-0 truncate flex justify-end">
      <SharedSortableHeaderItem
        v-bind="{
          sortBy,
          isAscending,
          value: MarketHeaderType.Volume
        }"
        @update:is-ascending="handleIsAscending"
        @update:sort-by="handleSortBy"
      >
        <template #default="{ isActive }">
          <div class="flex items-center space-x-1 cursor-pointer font-normal">
            <div :data-cy="dataCyTag(`sortBy-${MarketHeaderType.Volume}`)">
              {{ $t('markets.volume24h') }}
            </div>
            <UIcon
              :name="NuxtUiIcons.Triangle"
              :class="{
                'rotate-180': isActive && isAscending,
                'text-white': isActive
              }"
            />
          </div>
        </template>
      </SharedSortableHeaderItem>

      <div
        class="flex-2 lg:flex-1 min-w-0 truncate lg:text-right max-lg:text-center"
      >
        <div>
          {{ $t('trade.open_interest') }}
        </div>
      </div>
    </div>
  </div>
</template>
