<script lang="ts" setup>
withDefaults(
  defineProps<{
    tooltip?: string
    classes?: string
    tooltipClass?: string
    isDisabled?: boolean
    isNotStyled?: boolean
    textColorClass?: string
    borderColorClass?: string | Record<string, boolean>
    ui?: object
  }>(),
  {
    tooltip: '',
    classes: '',
    tooltipClass: 'p-1',
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
    :popper="{
      placement: 'top-start',
      strategy: 'fixed',
      offsetDistance: -40
    }"
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
          'border-b cursor-pointer': !isNotStyled && !isDisabled,
          'cursor-text': !isNotStyled && isDisabled
        }
      ]"
    >
      <slot />
    </span>

    <template #panel>
      <div :class="tooltipClass" class="text-xs text-coolGray-200 max-w-xs">
        <span v-if="tooltip">{{ tooltip }}</span>
        <slot v-else name="customTooltip" />
      </div>
    </template>
  </UPopover>
</template>
