<script lang="ts" setup>
defineProps({
  hideSmallBalances: Boolean,
  showMarginCurrencyOnly: Boolean,

  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:search', state: string): void
  (e: 'update:show-margin-currency-only', state: boolean): void
  (e: 'update:hide-small-balances', state: boolean): void
}>()

function handleSearch(val: string) {
  emit('update:search', val)
}

function toggleShowMarginCurrencyOnly(val: boolean) {
  emit('update:show-margin-currency-only', val)
}

function toggleHideSmallBalances(val: boolean) {
  emit('update:hide-small-balances', val)
}
</script>

<template>
  <div
    class="pt-4 flex flex-col gap-2 md:grid md:grid-cols-4 md:items-center md:gap-0"
  >
    <div class="col-span-2 grid grid-cols-2">
      <AppSearch
        name="search"
        class="col-span-1 w-full"
        input-classes="placeholder-white"
        dense
        transparent-bg
        data-cy="markets-search-input"
        :placeholder="$t('account.filterByAsset')"
        show-prefix
        :model-value="searchQuery"
        @update:modelValue="handleSearch"
      />
    </div>

    <div
      class="px-4 col-span-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-6 md:px-0"
    >
      <AppCheckbox
        :model-value="showMarginCurrencyOnly"
        data-cy="trade-page-filter-by-ticker-checkbox"
        class="lg:mr-4"
        @input="toggleShowMarginCurrencyOnly"
      >
        {{ $t('account.showMarginCurrencyOnly') }}
      </AppCheckbox>

      <AppCheckbox
        :model-value="hideSmallBalances"
        data-cy="trade-page-filter-by-ticker-checkbox"
        class="lg:mr-4"
        @input="toggleHideSmallBalances"
      >
        <div class="flex items-center justify-start">
          <span>{{ $t('account.hideSmallBalances') }}</span>

          <AppInfoTooltip
            class="ml-2"
            :tooltip="$t('account.hideSmallBalancesTooltip')"
          />
        </div>
      </AppCheckbox>
    </div>
  </div>
</template>
