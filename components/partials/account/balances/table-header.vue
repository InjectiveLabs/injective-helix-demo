<template>
  <tr class="h-14">
    <th class="pl-4">
      <SortableHeaderItem
        :value="BalanceHeaderType.Asset"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="markets-market-table-header"
        >
          {{ $t('account.balances.cols.asset') }}
        </span>
      </SortableHeaderItem>
    </th>

    <th>
      <SortableHeaderItem
        class="justify-end"
        :value="BalanceHeaderType.Total"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="markets-change_24h-table-header"
        >
          {{ $t('account.balances.cols.totalBalance') }}
        </span>
      </SortableHeaderItem>
    </th>

    <th>
      <SortableHeaderItem
        class="justify-end"
        :value="BalanceHeaderType.Available"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="markets-volume_24h-table-header"
        >
          {{ $t('account.balances.cols.availableBalance') }}
        </span>
      </SortableHeaderItem>
    </th>

    <th>
      <HeaderItem class="justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="markets-volume_24h-table-header"
        >
          {{ $t('account.balances.cols.inUseReserved') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <SortableHeaderItem
        class="justify-end"
        :value="BalanceHeaderType.Value"
        :sort-by="sortBy"
        :ascending="ascending"
        @sort="handleSort"
      >
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="markets-volume_24h-table-header"
        >
          {{ $t('account.balances.cols.value', { symbol: 'USD' }) }}
        </span>
      </SortableHeaderItem>
    </th>

    <th class="pr-4" />
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BalanceHeaderType } from '~/types'

import HeaderItem from '~/components/elements/header-item.vue'
import SortableHeaderItem from '~/components/elements/sortable-header-item.vue'

export default Vue.extend({
  components: {
    HeaderItem,
    SortableHeaderItem
  },

  props: {
    sortBy: {
      type: String as PropType<BalanceHeaderType>,
      required: true
    },

    ascending: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      BalanceHeaderType
    }
  },

  methods: {
    handleSort(sortBy: BalanceHeaderType) {
      this.$emit('update:sort-by', sortBy)
    }
  }
})
</script>
