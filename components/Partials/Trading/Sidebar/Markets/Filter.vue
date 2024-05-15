<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'

const props = defineProps({
  isGrid: Boolean,
  isLowVolumeMarketsVisible: Boolean,

  search: {
    type: String,
    required: true
  },

  activeType: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'update:search': [state: string]
  'update:activeType': [state: string]
  'update:isLowVolumeMarketsVisible': [state: boolean]
}>()

const filterList = [
  SharedMarketType.Favorite,
  '',
  SharedMarketType.Spot,
  SharedMarketType.Derivative
]

const activeTypeValue = computed({
  get: (): string => props.activeType,
  set: (type: string) => {
    emit('update:activeType', type)
  }
})

const searchValue = computed({
  get: (): string => props.search,
  set: (value: string) => {
    emit('update:search', value)
  }
})

const isLowVolumeMarketsVisibleValue = computed({
  get: (): boolean => props.isLowVolumeMarketsVisible,
  set: (type: boolean) => {
    emit('update:isLowVolumeMarketsVisible', type)
  }
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between flex-wrap">
      <div>
        <div
          v-if="!isGrid"
          class="flex items-center flex-wrap gap-5 lg:mb-2 3xl:mb-0"
        >
          <AppSelectButton
            v-for="marketType in filterList"
            :key="`market-type-${marketType}`"
            v-model="activeTypeValue"
            :value="marketType"
          >
            <template #default="{ isActive }">
              <span
                class="tracking-widest text-xs uppercase cursor-pointer select-none border-none p-0"
                :class="[
                  isActive
                    ? 'font-bold text-gray-200'
                    : 'text-gray-500 hover:text-gray-200'
                ]"
              >
                <SharedIcon
                  v-if="marketType === SharedMarketType.Favorite"
                  name="star"
                  class="min-w-4 h-4 w-4"
                />

                <span v-else-if="marketType === SharedMarketType.Derivative">
                  {{ $t('trade.futures') }}
                </span>

                <span v-else-if="marketType === SharedMarketType.Spot">
                  {{ $t('trade.spots') }}
                </span>

                <span v-else>
                  {{ $t('trade.all') }}
                </span>
              </span>
            </template>
          </AppSelectButton>
        </div>
      </div>

      <AppCheckbox2
        v-model="isLowVolumeMarketsVisibleValue"
        is-sm
        class="2xl:ml-2 3xl:ml-0 lg:mb-2 3xl:mb-0"
      >
        {{ $t('markets.showLowVol') }}
      </AppCheckbox2>
    </div>

    <div class="w-full mt-4">
      <AppSearch
        v-model="searchValue"
        class="w-full text-xs py-2"
        data-cy="markets-search-input"
        :placeholder="$t('trade.search_markets')"
      />
    </div>
  </div>
</template>
