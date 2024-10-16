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
