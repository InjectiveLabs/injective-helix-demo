<script setup lang="ts">
//
</script>

<template>
  <div class="grid grid-cols-8 p-2 table-label">
    <div class="shrink-0 p-2">{{ $t('account.assets') }}</div>
    <div class="shrink-0 p-2 text-right">
      {{ $t('account.available') }}
    </div>
    <div class="shrink-0 p-2 text-right">
      {{ $t('account.balances.cols.inUseReserved') }}
    </div>
    <div class="shrink-0 p-2 text-right">
      {{ $t('account.balances.cols.unrealized') }}
    </div>
    <div class="shrink-0 p-2 text-right">
      {{ $t('account.balances.cols.total') }}
    </div>
    <div class="shrink-0 p-2 text-right">
      {{ $t('account.balances.cols.totalValueUsd') }}
    </div>
    <div class="col-span-2 shrink-0 p-2 text-right">
      {{ $t('account.action') }}
    </div>
  </div>
</template>
