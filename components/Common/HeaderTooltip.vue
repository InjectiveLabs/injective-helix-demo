<script lang="ts" setup>
withDefaults(
  defineProps<{
    tooltip?: string
    classes?: string
    isDisabled?: boolean
    isNotStyled?: boolean
    textColorClass?: string
    borderColorClass?: string
  }>(),
  {
    tooltip: '',
    classes: '',
    isDisabled: false,
    isNotStyled: false,
    textColorClass: 'text-gray-350',
    borderColorClass: 'border-gray-400'
  }
)
</script>

<template>
  <UTooltip :text="tooltip" :disabled="isDisabled">
    <span
      :class="[
        classes,
        textColorClass,
        borderColorClass,
        {
          'text-xs normal-case border-dashed': !isNotStyled,
          'border-b cursor-pointer': !isNotStyled && !isDisabled
        }
      ]"
    >
      <slot />
    </span>
  </UTooltip>
</template>
