<script setup lang="ts">
const isFormDirty = useIsFormDirty()
const resetForm = useResetForm()
</script>

<template>
  <div
    v-if="isFormDirty"
    class="tab-label flex items-center px-4"
    @click="resetForm()"
  >
    <p class="text-red-500">Clear Filters</p>
  </div>
</template>
