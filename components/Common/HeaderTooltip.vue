<script lang="ts" setup>
withDefaults(
  defineProps<{
    tooltip?: string
    classes?: string
    tooltipClass?: string
    isDisabled?: boolean
    isNotStyled?: boolean
    textColorClass?: string
    borderColorClass?: string
    ui?: object
  }>(),
  {
    tooltip: '',
    classes: '',
    tooltipClass: '',
    isDisabled: false,
    isNotStyled: false,
    textColorClass: 'text-coolGray-350',
    borderColorClass: 'border-coolGray-400',
    ui: () => ({})
  }
)
</script>

<template>
  <UPopover
    mode="hover"
    :popper="{ placement: 'top', strategy: 'fixed', offsetDistance: 0 }"
    :disabled="isDisabled"
    :ui="ui"
  >
    <span
      :class="[
        classes,
        textColorClass,
        borderColorClass,
        {
          'normal-case border-dashed': !isNotStyled,
          'border-b cursor-pointer': !isNotStyled && !isDisabled
        }
      ]"
    >
      <slot />
    </span>

    <template v-if="tooltip" #panel>
      <div :class="tooltipClass">
        {{ tooltip }}
      </div>
    </template>
  </UPopover>
</template>
