<script setup lang="ts">
defineEmits<{
  handleCreate: []
}>()
</script>

<template>
  <div class="pt-4">
    <AppButton
      lg
      :class="{
        'hover:text-green-900 bg-green-500 text-green-800': true
      }"
      class="w-full font-sembold shadow-none"
      @click="$emit('handleCreate')"
    >
      <span>Create</span>
    </AppButton>
  </div>
</template>
