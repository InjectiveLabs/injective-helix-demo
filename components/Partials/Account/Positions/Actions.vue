<script lang="ts" setup>
import { BaseDropdownOption } from '@injectivelabs/ui-shared'

const positionStore = usePositionStore()

const props = defineProps({
  side: {
    type: String,
    default: ''
  },

  marketDenom: {
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
  'update:market-denom': [state: string]
  'update:side': [state: string]
  'positions:close': []
}>()

const showFilters = ref(true)

const side = computed({
  get: (): string => props.side,
  set: (value: string) => {
    emit('update:side', value)
  }
})

const marketDenom = computed({
  get: (): string => props.marketDenom,
  set: (value: string) => {
    emit('update:market-denom', value)
  }
})

onMounted(() => {
  modifyFilterVisibility()
})

function modifyFilterVisibility() {
  showFilters.value = window.innerWidth > 768
}

function closeAllPositions() {
  emit('positions:close')
}

function toggleFilters() {
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
        @click="toggleFilters"
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
        @click="closeAllPositions"
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
        is-searchable
        is-clearable
        data-cy="universal-table-filter-by-asset-input"
      >
        <template #selected-option="{ option }">
          <PartialsAccountPositionsFilterOption
            v-if="option"
            :option="option"
          />
        </template>

        <template #option="{ option, isActive }">
          <PartialsAccountPositionsFilterOption
            :option="option"
            :is-active="isActive"
          />
        </template>
      </AppSelectField>

      <AppSelectField
        v-if="showFilters"
        v-model="side"
        :options="sideOptions"
        :placeholder="$t('account.positions.side.label')"
        :selected-class="'border-gray-600'"
        is-clearable
        data-cy="universal-table-filter-by-side-select"
      />
    </div>

    <div class="col-span-1 items-center justify-end gap-6 hidden md:flex">
      <button
        v-if="positionStore.subaccountPositions.length"
        class="bg-red-500 bg-opacity-20 rounded-lg px-3 h-8 flex items-center justify-center w-full md:w-auto"
        data-cy="trading-account-positions-table-cancel-all-button"
        @click="closeAllPositions"
      >
        <span class="text-xs text-red-500">
          {{ $t('account.positions.closeAllPositions') }}
        </span>
      </button>
    </div>
  </div>
</template>
