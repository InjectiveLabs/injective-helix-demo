<script setup lang="ts">
//
</script>

<template>
  <div class="flex p-2 table-label">
    <div class="shrink-0 flex-[2] p-2">{{ $t('account.assets') }}</div>
    <div class="shrink-0 flex-[2] p-2">{{ $t('account.available') }}</div>
    <div class="shrink-0 flex-[2] p-2">
      {{ $t('account.balances.cols.inUseReserved') }}
    </div>
    <div class="shrink-0 flex-[2] p-2">
      {{ $t('account.balances.cols.unrealized') }}
    </div>
    <div class="shrink-0 flex-[2] p-2">
      {{ $t('account.balances.cols.total') }}
    </div>
    <div class="shrink-0 flex-[2] p-2">
      {{ $t('account.balances.cols.totalValueUsd') }}
    </div>
    <div class="flex-[3] p-2">{{ $t('account.action') }}</div>
  </div>
</template>
