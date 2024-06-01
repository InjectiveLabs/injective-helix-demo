<script setup lang="ts">
defineProps({
  disabled: Boolean,

  tooltip: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <BaseTooltip v-if="tooltip" :triggers="['hover', 'click']">
    <AppButton :disabled="disabled" v-bind="$attrs">
      <slot />
    </AppButton>

    <template #content>
      <span>{{ tooltip }}</span>
    </template>
  </BaseTooltip>

  <AppButton v-else :disabled="disabled" v-bind="$attrs">
    <slot />
  </AppButton>
</template>
