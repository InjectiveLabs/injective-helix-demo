<script setup lang="ts">
//
</script>

<template>
  <div class="flex p-2 text-gray-400 text-xs">
    <div class="flex-1 p-2 flex items-center">{{ $t('trade.market') }}</div>
    <div class="flex-1 p-2 flex items-center">{{ $t('trade.side') }}</div>
    <div class="flex-1 p-2 flex items-center">{{ $t('trade.amount') }}</div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.entryMark') }}
    </div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.unrealizedPnl') }}
    </div>

    <div class="flex-1 p-2 flex items-center">Total Value (USD)</div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.margin') }}
    </div>
    <div class="flex-1 p-2 flex items-center">
      {{ $t('account.positions.cols.leverage') }}
    </div>
    <div class="flex-1 p-2 flex items-center"></div>
  </div>
</template>
