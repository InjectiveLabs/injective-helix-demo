<script setup lang="ts">
//
</script>

<template>
  <div class="space-y-4 mb-4">
    <p class="field-label">1. {{ $t('sgt.priceRange') }}</p>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <p class="text-xs text-gray-500">{{ $t('sgt.lower') }}</p>
        <AppInputField placeholder="0.00" />
      </div>

      <div class="space-y-2">
        <p class="text-xs text-gray-500">{{ $t('sgt.upper') }}</p>
        <AppInputField placeholder="0.00" />
      </div>
    </div>
  </div>
</template>
