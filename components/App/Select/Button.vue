<script lang="ts" setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },

  value: {
    type: String,
    required: true
  }
})
</script>

<template>
  <BaseSelectorItem :model-value="modelValue" :value="value" v-bind="$attrs">
    <template #default="{ active }">
      <div class="cursor-pointer">
        <slot :active="active" />
      </div>
    </template>
  </BaseSelectorItem>
</template>
