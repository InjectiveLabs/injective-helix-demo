<script setup lang="ts">
const {
  sortBy,
  search,
  activeType,
  isAscending,
  sortedMarkets,
  activeCategory,
  activeTypeOptions,
  activeCategoryOptions
} = useMarkets()
</script>

<template>
  <div class="relative">
    <div class="z-10 sticky top-0 bg-brand-900 border-b">
      <div class="p-2 space-y-2">
        <div class="border-b py-2">
          <label class="flex rounded p-1">
            <div class="flex items-center text-gray-500">
              <BaseIcon name="search" />
            </div>

            <input
              id="search-market"
              v-model="search"
              v-focus
              placeholder="Search Market..."
              type="text"
              class="p-1 focus:outline-none placeholder:text-gray-600 flex-1 !bg-transparent"
              autocomplete="off"
            />
          </label>
        </div>

        <div class="flex gap-2 flex-wrap">
          <AppButtonSelect
            v-for="category in activeTypeOptions"
            :key="category.value"
            v-model="activeType"
            v-bind="{ value: category.value }"
            class="py-1 px-2 rounded text-xs bg-brand-850 tracking-wider capitalize text-gray-500"
            active-classes="text-white !bg-brand-700"
          >
            {{ category.value }}
          </AppButtonSelect>
        </div>

        <div class="flex gap-2 flex-wrap">
          <AppButtonSelect
            v-for="category in activeCategoryOptions"
            :key="category.value"
            v-model="activeCategory"
            v-bind="{ value: category.value }"
            class="py-1 px-2 rounded text-xs bg-brand-850 tracking-wider capitalize text-gray-500"
            active-classes="text-white !bg-brand-700"
          >
            {{ category.value }}
          </AppButtonSelect>
        </div>
      </div>

      <PartialsMarketsCommonMarketsHeader
        v-bind="{ sortBy, isAscending }"
        @update:is-ascending="isAscending = $event"
        @update:sort-by="sortBy = $event"
      />
    </div>

    <div class="divide-y">
      <PartialsMarketsCommonMarketsRow
        v-for="{ market, summary, volumeInUsd } in sortedMarkets"
        :key="market.marketId"
        v-bind="{ market, summary, volumeInUsd }"
      />
    </div>
  </div>
</template>
