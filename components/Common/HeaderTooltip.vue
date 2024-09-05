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
  <SharedHoverMenu popper-class="tooltip" :disabled="isDisabled">
    <template #default>
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
    </template>

    <template #content>
      <slot name="tooltip">
        {{ tooltip }}
      </slot>
    </template>
  </SharedHoverMenu>
</template>
