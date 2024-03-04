<script setup lang="ts">
//
</script>

<template>
  <div class="space-y-4 mb-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <p class="field-label">{{ $t('sgt.lower') }}</p>
        <AppInputField placeholder="0.00" />
      </div>

      <div class="space-y-2">
        <p class="field-label">{{ $t('sgt.upper') }}</p>
        <AppInputField placeholder="0.00" />
      </div>
    </div>
  </div>
</template>
