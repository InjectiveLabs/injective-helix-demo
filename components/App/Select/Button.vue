<script lang="ts" setup>
withDefaults(
  defineProps<{
    value: string
    modelValue: string
  }>(),
  {}
)
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
