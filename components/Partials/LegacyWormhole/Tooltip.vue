<script lang="ts" setup>
defineProps({
  content: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <AppTooltip v-bind="{ content }">
    <template #default>
      <BaseIcon
        name="exclamation-circle-fill"
        class="text-orange-300 w-4 h-4 min-w-4"
      />
    </template>
  </AppTooltip>
</template>
