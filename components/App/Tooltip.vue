<script lang="ts" setup>
withDefaults(
  defineProps<{
    isLg?: boolean
    content?: string
    isWarning?: boolean
    contentClass?: string
  }>(),
  {
    isLg: false,
    content: '',
    isWarning: false,
    contentClass: ''
  }
)
</script>

<template>
  <SharedTooltip :triggers="['hover', 'click']">
    <slot>
      <SharedIcon
        name="circle-info"
        :class="{
          'w-4 h-4 min-w-4': isLg,
          'w-3 h-3 min-w-3': !isLg,
          'text-gray-500': !isWarning,
          'text-orange-200': isWarning
        }"
      />
    </slot>

    <template #content>
      <div class="leading-4" :class="contentClass">
        <slot name="content">
          {{ content }}
        </slot>
      </div>
    </template>
  </SharedTooltip>
</template>

<style>
.tooltip,
.v-popper--theme-tooltip {
  .v-popper__inner {
    @apply bg-gray-900 text-gray-200 border-none max-w-xs text-xs px-3 py-1 shadow-sm;
  }

  .v-popper__arrow-outer,
  .v-popper__arrow-inner {
    @apply border-gray-900;
  }
}
</style>
