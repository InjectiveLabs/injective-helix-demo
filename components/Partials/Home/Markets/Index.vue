<script lang="ts" setup>
import { MarketFilterType } from '@/types'

const FilterList = [MarketFilterType.Volume, MarketFilterType.New]

const activeType = ref(MarketFilterType.Volume)
</script>

<template>
  <AppPanelLight>
    <template #context>
      <div
        class="flex items-center justify-center sm:my-2 -mx-2 font-semibold gap-4 sm:gap-6"
      >
        <AppSelectButton
          v-for="filterType in Object.values(FilterList)"
          :key="`market-filter-type-${filterType}`"
          v-model="activeType"
          :value="filterType"
        >
          <template #default="{ active }">
            <span
              class="text-xl text-gray-300 hover:opacity-100"
              :class="[active ? 'opacity-100' : ' opacity-30']"
            >
              <span v-if="filterType === MarketFilterType.Volume">
                {{ $t('home.trending') }}
              </span>

              <span v-if="filterType === MarketFilterType.New">
                {{ $t('home.newlyAdded') }}
              </span>
            </span>
          </template>
        </AppSelectButton>
      </div>
    </template>

    <PartialsHomeCommonMarkets :filter-type="activeType" :limit="10" />
  </AppPanelLight>
</template>
