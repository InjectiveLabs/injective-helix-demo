<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
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
  (e: 'update:activeType', state: string): void
  (e: 'update:search', state: string): void
}>()

const filterList = [
  MarketType.Favorite,
  '',
  MarketType.Spot,
  MarketType.Derivative
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
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="flex items-center flex-wrap gap-5">
        <AppSelectButton
          v-for="marketType in filterList"
          :key="`market-type-${marketType}`"
          v-model="activeTypeValue"
          :value="marketType"
        >
          <template #default="{ active }">
            <span
              class="tracking-widest text-xs uppercase cursor-pointer select-none border-none p-0"
              :class="[
                active
                  ? 'font-bold text-gray-200'
                  : 'text-gray-500 hover:text-gray-200'
              ]"
            >
              <BaseIcon
                v-if="marketType === MarketType.Favorite"
                name="star"
                class="min-w-4 h-4 w-4"
              />

              <span v-else-if="marketType === MarketType.Derivative">
                {{ $t('trade.futures') }}
              </span>

              <span v-else-if="marketType === MarketType.Spot">
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

    <div class="w-full mt-4">
      <AppSearch
        v-model="searchValue"
        class="w-full"
        data-cy="markets-search-input"
        :placeholder="$t('trade.search_markets')"
      />
    </div>
  </div>
</template>
