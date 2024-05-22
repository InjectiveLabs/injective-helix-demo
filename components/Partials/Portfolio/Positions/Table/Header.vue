<script setup lang="ts">
//
</script>

<template>
  <div class="flex p-2 table-label">
    <div class="flex-1 p-2 flex items-center">{{ $t('trade.market') }}</div>
    <div class="flex-1 p-2 flex items-center">{{ $t('trade.side') }}</div>
    <div class="flex-1 p-2 flex items-center">{{ $t('trade.amount') }}</div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.entryMark') }}
    </div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.unrealizedPnl') }}
    </div>

    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.balances.cols.totalValueUsd') }}
    </div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.margin') }}
    </div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('trade.liquidation_price') }}
    </div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.leverage') }}
    </div>
    <div class="flex-[3] p-2 flex items-center">
      {{ $t('trade.closePosition') }}
    </div>
  </div>
</template>
