<script lang="ts" setup>
import { BalanceHeaderType } from '@/types'

const props = defineProps({
  isAscending: Boolean,
  isPositionsLoading: Boolean,

  sortBy: {
    type: String as PropType<BalanceHeaderType>,
    required: true
  }
})

const emit = defineEmits<{
  'update:sort-by': [state: string]
  'update:isAscending': [state: boolean]
}>()

const sortByValue = computed({
  get: (): string => props.sortBy,
  set: (type: string) => {
    emit('update:sort-by', type)
  }
})

const isAscendingValue = computed({
  get: (): boolean => props.isAscending,
  set: (type: boolean) => {
    emit('update:isAscending', type)
  }
})
</script>

<template>
  <tr class="h-14">
    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:isAscending="isAscendingValue"
      :value="BalanceHeaderType.Asset"
      class="pl-2"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.asset') }}
      </span>
    </AppSortableHeaderItem>

    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:isAscending="isAscendingValue"
      class="justify-end"
      :value="BalanceHeaderType.Available"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.availableBalance') }}
      </span>
    </AppSortableHeaderItem>

    <AppHeaderItem class="justify-end">
      <CommonHeaderTooltip
        v-bind="{
          tooltip: $t('account.balances.inUseReservedTooltip')
        }"
      >
        {{ $t('account.balances.cols.inUseReserved') }}
      </CommonHeaderTooltip>
    </AppHeaderItem>

    <AppHeaderItem class="justify-end">
      <CommonHeaderTooltip
        v-bind="{
          tooltip: isPositionsLoading
            ? $t('account.unrealizedPnLLoading')
            : $t('account.balances.unrealizedTooltip')
        }"
      >
        <span class="inline-block">
          {{ $t('account.balances.cols.unrealized') }}
          <AppSpinner
            v-if="isPositionsLoading"
            is-xs
            class="float-right ml-1 mt-1"
          />
        </span>
      </CommonHeaderTooltip>
    </AppHeaderItem>

    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:isAscending="isAscendingValue"
      class="justify-end"
      :value="BalanceHeaderType.Total"
    >
      <span class="text-gray-350 text-xs normal-case">
        {{ $t('account.balances.cols.totalBalance') }}
      </span>
    </AppSortableHeaderItem>

    <AppSortableHeaderItem
      v-model:sort-by="sortByValue"
      v-model:isAscending="isAscendingValue"
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
