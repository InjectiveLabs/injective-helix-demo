<script setup lang="ts">
defineEmits<{
  (e: 'update:subaccount', subaccount: string): void
}>()
</script>

<template>
  <div class="flex items-center py-4">
    <h1 class="text-3xl font-semibold mr-4">Activity</h1>
    <PartialsActivitySubaccountsSelector
      @update:subaccount="$emit('update:subaccount')"
    />
  </div>
</template>
