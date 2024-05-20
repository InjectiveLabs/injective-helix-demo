<script setup lang="ts">
const isFormDirty = useIsFormDirty()
const resetForm = useResetForm()

const emit = defineEmits<{
  'form:reset': []
}>()

function onFormReset() {
  resetForm()
  emit('form:reset')
}
</script>

<template>
  <div
    v-if="isFormDirty"
    class="tab-label flex items-center px-4"
    @click="onFormReset"
  >
    <p class="text-red-500">Clear Filters</p>
  </div>
</template>
