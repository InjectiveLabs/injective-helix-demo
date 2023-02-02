<template>
  <tr class="h-14">
    <AppHeaderItem class="col-span-1 justify-start pl-2">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-market-table-header"
      >
        {{ $t('account.positions.cols.market') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-start">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-side-table-header"
      >
        {{ $t('account.positions.cols.side') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-quantity-table-header"
      >
        {{ $t('account.positions.cols.quantity') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-entryMark-table-header"
      >
        {{ $t('account.positions.cols.entryMark') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-estLiquidationPrice-table-header"
      >
        {{ $t('account.positions.cols.estLiquidationPrice') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-unrealizedPnl-table-header"
      >
        {{ $t('account.positions.cols.unrealizedPnl') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-total-table-header"
      >
        {{ $t('account.positions.cols.total') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-margin-table-header"
      >
        {{ $t('account.positions.cols.margin') }}
      </span>
    </AppHeaderItem>

    <AppHeaderItem class="col-span-1 justify-end">
      <span
        class="text-gray-350 text-xs normal-case"
        data-cy="account-positions-leverage-table-header"
      >
        {{ $t('account.positions.cols.leverage') }}
      </span>
    </AppHeaderItem>

    <th class="pr-4" />
  </tr>
</template>
