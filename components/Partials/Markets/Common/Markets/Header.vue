<script setup lang="ts">
//
</script>

<template>
  <div class="flex bg-brand-825 border-y p-4 text-gray-500 text-xs">
    <div class="flex-[2] flex min-w-0 truncate">
      <span class="pl-6">
        {{ $t('trade.market') }}
      </span>
    </div>
    <div class="flex-1 min-w-0 truncate">{{ $t('trade.price') }}</div>
    <div class="flex-1 min-w-0 truncate">24h</div>
    <div class="flex-1 min-w-0 truncate">{{ $t('trade.volumeUsd') }}</div>
  </div>
</template>
