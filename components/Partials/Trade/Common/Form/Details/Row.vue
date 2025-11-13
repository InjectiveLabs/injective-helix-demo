<script setup lang="ts">
withDefaults(
  defineProps<{
    tooltip?: string
    labelClass?: string
  }>(),
  {
    labelClass: 'text-coolGray-450'
  }
)
</script>

<template>
  <div class="flex items-center justify-between text-xs font-medium">
    <CommonHeaderTooltip v-if="tooltip" :tooltip="tooltip">
      <p :class="labelClass">
        <slot name="label" />
      </p>
    </CommonHeaderTooltip>

    <p v-else :class="labelClass">
      <slot name="label" />
    </p>

    <span class="text-white">
      <slot name="value" />
    </span>
  </div>
</template>
