<script lang="ts" setup>
withDefaults(
  defineProps<{
    tooltip?: string
    classes?: string
    isDisabled?: boolean
    tooltipClass?: string
    isNotStyled?: boolean
    textColorClass?: string
    ui?: Record<string, any>
    popper?: Record<string, any>
    borderColorClass?: string | Record<string, boolean>
  }>(),
  {
    tooltip: '',
    classes: '',
    tooltipClass: 'p-1',
    textColorClass: 'text-coolGray-350',
    borderColorClass: 'border-coolGray-400',
    popper: () => ({
      placement: 'top',
      strategy: 'fixed'
    }),
    ui: () => ({
      width: 'max-w-96'
    })
  }
)
</script>

<template>
  <UPopover mode="hover" :popper="popper" :disabled="isDisabled" :ui="ui">
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
