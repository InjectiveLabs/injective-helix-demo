<script setup lang="ts">
defineProps({
  tooltip: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <BaseTooltip v-if="tooltip" :triggers="['hover', 'click']">
    <PartialsCommonCancelButton v-bind="$attrs" />

    <template #content>
      <span>{{ tooltip }}</span>
    </template>
  </BaseTooltip>

  <PartialsCommonCancelButton v-else v-bind="$attrs" />
</template>
