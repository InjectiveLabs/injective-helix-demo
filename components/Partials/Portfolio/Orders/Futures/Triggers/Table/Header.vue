<script setup lang="ts">
//
</script>

<template>
  <div class="table-label flex p-2">
    <div class="flex-1 p-2">{{ $t('trade.market') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.type') }}</div>
    <div class="flex-1 p-2">{{ $t('trade.side') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.price') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.amount') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.leverage') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.total') }}</div>
    <div class="flex-[2] p-2 text-right">
      {{ $t('trade.triggerCondition') }}
    </div>
    <div class="flex-1 p-2 text-center">{{ $t('trade.cancelOrder') }}</div>
  </div>
</template>
