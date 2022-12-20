<template>
  <div
    class="pt-4 flex flex-col gap-2 md:grid md:grid-cols-4 md:items-center md:gap-0"
  >
    <div class="col-span-2 grid grid-cols-2">
      <Search
        name="search"
        class="col-span-1 w-full"
        input-classes="placeholder-white"
        dense
        transparent-bg
        data-cy="markets-search-input"
        :placeholder="$t('account.filterByAsset')"
        :search="searchQuery"
        show-prefix
        @searched="handleSearch"
      />
    </div>

    <div
      class="px-4 col-span-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-6 md:px-0"
    >
      <VCheckbox
        :value="showMarginCurrencyOnly"
        data-cy="trade-page-filter-by-ticker-checkbox"
        class="lg:mr-4"
        @input="toggleShowMarginCurrencyOnly"
      >
        {{ $t('account.showMarginCurrencyOnly') }}
      </VCheckbox>

      <VCheckbox
        :value="hideSmallBalances"
        data-cy="trade-page-filter-by-ticker-checkbox"
        class="lg:mr-4"
        @input="toggleHideSmallBalances"
      >
        <div class="flex items-center justify-start">
          <span>{{ $t('account.hideSmallBalances') }}</span>

          <IconInfoTooltip
            class="ml-2"
            :tooltip="$t('account.hideSmallBalancesTooltip')"
          />
        </div>
      </VCheckbox>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Search from '~/components/inputs/search.vue'

export default Vue.extend({
  components: {
    Search
  },

  props: {
    searchQuery: {
      type: String,
      default: ''
    },

    showMarginCurrencyOnly: {
      type: Boolean,
      default: false
    },

    hideSmallBalances: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    handleSearch(val: string) {
      this.$emit('update:search', val)
    },

    toggleShowMarginCurrencyOnly(val: boolean) {
      this.$emit('update:show-margin-currency-only', val)
    },

    toggleHideSmallBalances(val: boolean) {
      this.$emit('update:hide-small-balances', val)
    }
  }
})
</script>
