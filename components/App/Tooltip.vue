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
  <UTooltip
    :text="content"
    :ui="{
      popper: {
        placement: 'top'
      }
    }"
  >
    <slot>
      <UIcon name="entypo:info-with-circle" />
    </slot>
  </UTooltip>
</template>
