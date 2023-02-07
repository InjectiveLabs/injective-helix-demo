<script lang="ts" setup>
const props = defineProps({
  lg: Boolean,

  tooltip: {
    type: String,
    default: ''
  }
})

const sizeClasses = computed(() => {
  if (props.lg) {
    return 'w-4 h-4 min-w-4'
  }

  return 'w-3 h-3 min-w-3'
})
</script>

<template>
  <BaseHoverMenu popper-class="tooltip">
    <template #default>
      <slot>
        <BaseIcon
          name="circle-info"
          class="text-gray-500"
          :class="[sizeClasses]"
        />
      </slot>
    </template>

    <template #content>
      {{ tooltip }}
    </template>
  </BaseHoverMenu>
</template>

<style>
.tooltip .v-popper__inner {
  @apply bg-gray-900 text-gray-200 border-none max-w-xs text-xs px-3 py-1 shadow-sm;
}

.tooltip .v-popper__arrow-outer,
.tooltip .v-popper__arrow-inner {
  @apply border-gray-900;
}
</style>
