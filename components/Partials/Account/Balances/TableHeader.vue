<script lang="ts" setup>
import { PropType } from 'vue'
import { BalanceHeaderType } from '@/types'

defineProps({
  sortBy: {
    type: String as PropType<BalanceHeaderType>,
    required: true
  },

  ascending: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:sort-by', state: string): void
  (e: 'update:ascending', state: boolean): void
}>()

function handleSort(value: string) {
  emit('update:sort-by', value)
}

function handleAscending(value: boolean) {
  emit('update:ascending', value)
}
</script>

<template>
  <tr class="h-14">
    <AppSortableHeaderItem
      :value="BalanceHeaderType.Asset"
      :sort-by="sortBy"
      :ascending="ascending"
      class="pl-2"
      @update:sort-by="handleSort"
      @update:ascending="handleAscending"
    >
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="markets-market-table-header"
      >
        {{ $t('account.balances.cols.asset') }}
      </span>
    </AppSortableHeaderItem>

    <AppSortableHeaderItem
      class="justify-end"
      :value="BalanceHeaderType.Total"
      :sort-by="sortBy"
      :ascending="ascending"
      @update:sort-by="handleSort"
      @update:ascending="handleAscending"
    >
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="markets-change_24h-table-header"
      >
        {{ $t('account.balances.cols.totalBalance') }}
      </span>
    </AppSortableHeaderItem>

    <AppSortableHeaderItem
      class="justify-end"
      :value="BalanceHeaderType.Available"
      :sort-by="sortBy"
      :ascending="ascending"
      @update:sort-by="handleSort"
      @update:ascending="handleAscending"
    >
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="markets-volume_24h-table-header"
      >
        {{ $t('account.balances.cols.availableBalance') }}
      </span>
    </AppSortableHeaderItem>

    <AppHeaderItem class="justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="markets-volume_24h-table-header"
      >
        {{ $t('account.balances.cols.inUseReserved') }}
      </span>
    </AppHeaderItem>

    <AppSortableHeaderItem
      class="select-none justify-end"
      :value="BalanceHeaderType.Value"
      :sort-by="sortBy"
      :ascending="ascending"
      @update:sort-by="handleSort"
      @update:ascending="handleAscending"
    >
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="markets-volume_24h-table-header"
      >
        {{ $t('account.balances.cols.value', { symbol: 'USD' }) }}
      </span>
    </AppSortableHeaderItem>

    <th class="pr-4" />
  </tr>
</template>
