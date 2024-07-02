<script setup lang="ts">
//
</script>

<template>
  <div class="table-label flex p-2">
    <div class="flex-1 p-2">{{ $t('trade.market') }}</div>
    <div class="flex-[0.5] p-2">{{ $t('trade.side') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.price') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.amount') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.unfilled') }}</div>
    <div class="flex-1 p-2 text-right">{{ $t('trade.filled') }}</div>
    <div class="flex-1 p-2 text-right">
      {{ $t('sgt.totalAmount') }}
    </div>
    <div class="flex-1 p-2 flex justify-center space-x-2 items-center">
      <p>{{ $t('trade.chase') }}</p>
      <AppTooltip v-bind="{ content: $t('trade.chaseTooltip') }" />
    </div>
    <div class="flex-1 p-2 text-center">{{ $t('trade.cancelOrder') }}</div>
  </div>
</template>
