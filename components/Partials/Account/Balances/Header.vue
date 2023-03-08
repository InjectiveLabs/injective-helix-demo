<script lang="ts" setup>
import { PropType } from 'vue'
import { BalanceHeaderType } from '@/types'

const props = defineProps({
  ascending: Boolean,

  sortBy: {
    type: String as PropType<BalanceHeaderType>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:sort-by', state: string): void
  (e: 'update:ascending', state: boolean): void
}>()

const sortByValue = computed({
  get: (): string => props.sortBy,
  set: (type: string) => {
    emit('update:sort-by', type)
  }
})

const ascendingValue = computed({
  get: (): boolean => props.ascending,
  set: (type: boolean) => {
    emit('update:ascending', type)
  }
})
</script>

<template>
  <tr class="h-14">
    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:ascending="ascendingValue"
      :value="BalanceHeaderType.Asset"
      class="pl-2"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.asset') }}
      </span>
    </AppSortableHeaderItem>

    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:ascending="ascendingValue"
      class="justify-end"
      :value="BalanceHeaderType.Available"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.availableBalance') }}
      </span>
    </AppSortableHeaderItem>

    <AppHeaderItem class="justify-end">
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.inUseReserved') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="justify-end">
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.unrealized') }}
      </span>
    </AppHeaderItem>

    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:ascending="ascendingValue"
      class="justify-end"
      :value="BalanceHeaderType.Total"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.totalBalance') }}
      </span>
    </AppSortableHeaderItem>

    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:ascending="ascendingValue"
      class="select-none justify-end"
      :value="BalanceHeaderType.Value"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.value', { symbol: 'USD' }) }}
      </span>
    </AppSortableHeaderItem>

    <th class="pr-4" />
  </tr>
</template>
