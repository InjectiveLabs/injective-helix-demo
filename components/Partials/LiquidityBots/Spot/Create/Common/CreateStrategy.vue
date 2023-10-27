<script setup lang="ts">
//
</script>

<template>
  <AppButton
    lg
    class="w-full shadow-none select-none"
    :class="[
      false
        ? 'bg-gray-475 text-white hover:opacity-80 pointer-events-none'
        : 'bg-blue-500 text-blue-900'
    ]"
  >
    <span>{{ $t('sgt.create') }}</span>
  </AppButton>
</template>
