<script setup lang="ts">
//
</script>

<template>
  <div class="table-label flex p-2">
    <div class="flex-1 p-2">{{ $t('trade.market') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.side') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.price') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.amount') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.unfilled') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.filled') }}</div>
    <div class="flex-1 p-2">{{ $t('sgt.totalAmount') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.cancelOrder') }}</div>
  </div>
</template>
