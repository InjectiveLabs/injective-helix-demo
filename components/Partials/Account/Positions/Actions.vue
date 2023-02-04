<script lang="ts" setup>
import { PropType } from 'vue'
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const positionStore = usePositionStore()

const props = defineProps({
  marketDenom: {
    type: String,
    default: ''
  },

  side: {
    type: String,
    default: ''
  },

  marketOptions: {
    type: Array as PropType<BaseDropdownOption[]>,
    required: true
  },

  sideOptions: {
    type: Array as PropType<BaseDropdownOption[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:market-denom', state: string): void
  (e: 'update:side', state: string): void
  (e: 'positions:close'): void
}>()

const showFilters = ref(true)

const side = computed({
  get: (): string => {
    return props.side
  },

  set: (value: string) => {
    emit('update:side', value)
  }
})

const marketDenom = computed({
  get: (): string => {
    return props.marketDenom
  },

  set: (value: string) => {
    emit('update:market-denom', value)
  }
})

onMounted(() => {
  updateFilterVisibility()
})

function updateFilterVisibility() {
  showFilters.value = window.innerWidth > 768
}

function handleCloseAllPositions() {
  emit('positions:close')
}

function handleToggleFilters() {
  showFilters.value = !showFilters.value
}
</script>

<template>
  <div class="flex flex-col gap-4 md:grid md:grid-cols-4 md:items-center py-4">
    <div
      class="col-span-3 grid grid-cols-2 md:grid-cols-4 items-center gap-4 md:gap-6 w-full"
    >
      <div
        class="flex justify-start items-center gap-2 md:hidden cursor-pointer"
        @click="handleToggleFilters"
      >
        <span
          class="text-sm"
          :class="{
            'text-gray-500': !showFilters,
            'text-white': showFilters
          }"
        >
          {{ $t('account.filters') }}
        </span>

        <BaseIcon
          name="filter"
          class="w-4 h-4"
          :class="{
            'text-gray-500': !showFilters,
            'text-white': showFilters
          }"
        />
      </div>

      <button
        v-if="positionStore.subaccountPositions.length"
        class="bg-red-500 bg-opacity-20 rounded-lg px-3 h-8 flex md:hidden items-center justify-center w-auto"
        data-cy="trading-account-positions-table-cancel-all-button"
        @click="handleCloseAllPositions"
      >
        <span class="text-xs text-red-500">
          {{ $t('account.positions.closeAllPositions') }}
        </span>
      </button>

      <AppSelectField
        v-if="showFilters"
        v-model="marketDenom"
        :options="marketOptions"
        :placeholder="$t('account.positions.market.label')"
        :selected-class="'border-gray-600'"
        searchable
        clearable
        data-cy="universal-table-filter-by-asset-input"
      >
        <template #selected-option="{ option }">
          <PartialsAccountPositionsFilterOption
            v-if="option"
            :option="option"
          />
        </template>

        <template #option="{ option, active }">
          <PartialsAccountPositionsFilterOption
            :option="option"
            :active="active"
          />
        </template>
      </AppSelectField>

      <AppSelectField
        v-if="showFilters"
        v-model="side"
        :options="sideOptions"
        :placeholder="$t('account.positions.side.label')"
        :selected-class="'border-gray-600'"
        clearable
        data-cy="universal-table-filter-by-side-select"
      />
    </div>

    <div class="col-span-1 items-center justify-end gap-6 hidden md:flex">
      <button
        v-if="positionStore.subaccountPositions.length"
        class="bg-red-500 bg-opacity-20 rounded-lg px-3 h-8 flex items-center justify-center w-full md:w-auto"
        data-cy="trading-account-positions-table-cancel-all-button"
        @click="handleCloseAllPositions"
      >
        <span class="text-xs text-red-500">
          {{ $t('account.positions.closeAllPositions') }}
        </span>
      </button>
    </div>
  </div>
</template>
