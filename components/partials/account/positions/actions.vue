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
            'text-helixGray-300': !showFilters,
            'text-white': showFilters
          }"
        >
          {{ $t('account.filters') }}
        </span>

        <IconFilters
          class="w-4 h-4"
          :class="{
            'text-helixGray-300': !showFilters,
            'text-white': showFilters
          }"
        />
      </div>

      <button
        class="bg-red-500 bg-opacity-20 rounded-lg px-3 h-8 flex md:hidden items-center justify-center w-auto"
        data-cy="trading-account-positions-table-cancel-all-button"
        @click="handleCloseAllPositions"
      >
        <span class="text-xs text-red-500">
          {{ $t('account.positions.closeAllPositions') }}
        </span>
      </button>

      <Select
        v-if="showFilters"
        class="col-span-1 flex items-center justify-between h-10 rounded-lg border border-gray-600 relative w-full md:w-auto"
        :options="marketOptions"
        :value="marketDenom"
        data-cy="universal-table-filter-by-asset-input"
        @change="handleMarketDenomChange"
      >
        <template #selected>
          <FilterOption
            :label="marketLabel"
            :label-class="selectedFilterLabelClass"
            :denom="marketDenom"
          />
        </template>

        <template #option="{ option }">
          <FilterOption :label="option.label" :denom="option.value" />
        </template>
      </Select>

      <Select
        v-if="showFilters"
        class="col-span-1 flex items-center justify-between h-10 rounded-lg border border-gray-600 relative w-full md:w-auto"
        :options="sideOptions"
        :value="side"
        data-cy="universal-table-filter-by-side-select"
        @change="handleSideChange"
      >
        <template #selected>
          <span
            class="text-sm"
            :class="{
              'text-gray-600': !side,
              'text-white': side
            }"
          >
            {{ sideLabel }}
          </span>
        </template>
      </Select>
    </div>

    <div class="col-span-1 items-center justify-end gap-6 hidden md:flex">
      <button
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

<script lang="ts">
import Vue, { PropType } from 'vue'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import Select from '@/components/elements/select.vue'
import FilterOption from '@/components/partials/account/positions/filter-option.vue'
import { SelectOption } from '~/types'

export default Vue.extend({
  components: {
    Select,
    FilterOption
  },

  props: {
    marketDenom: {
      type: String,
      required: true
    },

    side: {
      type: String,
      required: true
    },

    marketOptions: {
      type: Array as PropType<SelectOption[]>,
      required: true
    },

    sideOptions: {
      type: Array as PropType<SelectOption[]>,
      required: true
    }
  },

  data() {
    return {
      showFilters: true
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    width(): number {
      return this.$window.state.width
    },

    marketLabel(): string {
      const { marketDenom, marketOptions } = this

      if (!marketDenom) {
        return this.$t('account.positions.market.label')
      }

      const result = marketOptions.find(
        (o: SelectOption) => o.value === marketDenom
      )

      if (!result) {
        return this.$t('account.positions.market.label')
      }

      return result.label
    },

    sideLabel(): string {
      const { side, sideOptions } = this

      if (!side) {
        return this.$t('account.positions.side.label')
      }

      const result = sideOptions.find((o: SelectOption) => o.value === side)

      if (side === '' || !result) {
        return this.$t('account.positions.side.label')
      }

      return result.label
    },

    selectedFilterLabelClass(): string {
      const { marketDenom } = this

      const classes = ['text-sm']

      if (marketDenom) {
        classes.push('text-white')
      } else {
        classes.push('text-gray-600')
      }

      return classes.join(' ')
    }
  },

  mounted() {
    this.updateFilterVisibility()
  },

  methods: {
    updateFilterVisibility() {
      const { width } = this

      this.showFilters = width > 768
    },

    handleMarketDenomChange({ value }: { value: string }) {
      this.$emit('update:market-denom', value)
    },

    handleSideChange({ value }: { value: string }) {
      this.$emit('update:side', value)
    },

    handleCloseAllPositions() {
      this.$emit('close-all-positions')
    },

    handleToggleFilters() {
      this.showFilters = !this.showFilters
    }
  }
})
</script>
