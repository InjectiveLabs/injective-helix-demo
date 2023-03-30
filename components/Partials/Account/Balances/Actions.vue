<script lang="ts" setup>
const props = defineProps({
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
  (e: 'update:subaccount', state: string): void
}>()

const hideSmallBalancesCheck = computed({
  get: (): boolean => props.hideSmallBalances,
  set: (type: boolean) => {
    emit('update:hide-small-balances', type)
  }
})

const showMarginCurrencyOnlyCheck = computed({
  get: (): boolean => props.showMarginCurrencyOnly,
  set: (type: boolean) => {
    emit('update:show-margin-currency-only', type)
  }
})

const search = computed({
  get: (): string => props.searchQuery,
  set: (type: string) => {
    emit('update:search', type)
  }
})
</script>

<template>
  <div
    class="pt-4 lg:px-4 flex flex-wrap justify-between gap-3 md:grid md:grid-cols-4 md:items-center md:gap-0"
  >
    <div class="col-span-2 grid grid-cols-2">
      <AppSearch
        v-model="search"
        name="search"
        class="col-span-1 w-full"
        data-cy="markets-search-input"
        input-classes="placeholder-white"
        dense
        transparent-bg
        show-prefix
        :placeholder="$t('account.filterByAsset')"
      />
    </div>

    <div
      class="col-span-2 flex flex-wrap gap-2 flex-row md:flex-nowrap md:items-center md:justify-end md:gap-6 md:px-0"
    >
      <AppCheckbox
        v-model="showMarginCurrencyOnlyCheck"
        data-cy="trade-page-filter-by-ticker-checkbox"
      >
        {{ $t('account.showMarginCurrencyOnly') }}
      </AppCheckbox>

      <AppCheckbox
        v-model="hideSmallBalancesCheck"
        data-cy="trade-page-filter-by-ticker-checkbox"
      >
        <div class="flex items-center justify-start">
          <span>{{ $t('account.hideSmallBalances') }}</span>

          <CommonInfoTooltip
            class="ml-2"
            :tooltip="$t('account.hideSmallBalancesTooltip')"
          />
        </div>
      </AppCheckbox>
    </div>
  </div>
</template>
