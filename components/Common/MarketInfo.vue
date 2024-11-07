<script lang="ts" setup>
withDefaults(
  defineProps<{
    title: string
    tooltip?: string
  }>(),
  {
    tooltip: ''
  }
)
</script>

<template>
  <div class="w-auto px-0 lg:px-3">
    <span
      class="text-coolGray-500 mb-1 w-full lg:text-right text-xs flex items-center lg:justify-between whitespace-nowrap"
    >
      {{ title }}
      <AppTooltip v-if="tooltip" class="ml-2" :content="tooltip" />
    </span>
    <div>
      <slot></slot>
    </div>
  </div>
</template>
