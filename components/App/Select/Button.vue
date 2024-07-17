<script lang="ts" setup>
defineProps({
  value: {
    type: String,
    required: true
  },

  modelValue: {
    type: String,
    required: true
  }
})
</script>

<template>
  <SharedSelectorItem :model-value="modelValue" :value="value" v-bind="$attrs">
    <template #default="{ isActive }">
      <div class="cursor-pointer">
        <slot :is-active="isActive" />
      </div>
    </template>
  </SharedSelectorItem>
</template>
