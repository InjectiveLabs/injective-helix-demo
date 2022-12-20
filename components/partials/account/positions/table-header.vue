<template>
  <tr class="h-14">
    <th class="pl-4">
      <HeaderItem class="col-span-1 justify-start">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-market-table-header"
        >
          {{ $t('account.positions.cols.market') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-start">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-side-table-header"
        >
          {{ $t('account.positions.cols.side') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-quantity-table-header"
        >
          {{ $t('account.positions.cols.quantity') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-entryMark-table-header"
        >
          {{ $t('account.positions.cols.entryMark') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-estLiquidationPrice-table-header"
        >
          {{ $t('account.positions.cols.estLiquidationPrice') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-unrealizedPnl-table-header"
        >
          {{ $t('account.positions.cols.unrealizedPnl') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-total-table-header"
        >
          {{ $t('account.positions.cols.total') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-margin-table-header"
        >
          {{ $t('account.positions.cols.margin') }}
        </span>
      </HeaderItem>
    </th>

    <th>
      <HeaderItem class="col-span-1 justify-end">
        <span
          class="text-gray-350 text-xs normal-case"
          data-cy="account-positions-leverage-table-header"
        >
          {{ $t('account.positions.cols.leverage') }}
        </span>
      </HeaderItem>
    </th>

    <th class="pr-4" />
  </tr>
</template>

<script lang="ts">
import Vue from 'vue'
import HeaderItem from '~/components/elements/header-item.vue'

export default Vue.extend({
  components: {
    HeaderItem
  }
})
</script>
