<script setup lang="ts">
defineOptions({
  inheritAttrs: true
})

const props = withDefaults(
  defineProps<{
    size?: any
    ui?: object
    color?: any
    type?: string
    variant?: any
    block?: boolean
    square?: boolean
    padded?: boolean
    leading?: boolean
    loading?: boolean
    truncate?: boolean
    trailing?: boolean
    disabled?: boolean
    loadingIcon?: string
    icon?: string | undefined
    label?: string | undefined
    leadingIcon?: string | undefined
    trailingIcon?: string | undefined
    class?: string | object | Array<string | object>
  }>(),
  {
    class: '',
    padded: true,
    type: 'button',
    icon: undefined,
    size: undefined,
    label: undefined,
    color: undefined,
    variant: undefined,
    leadingIcon: undefined,
    loadingIcon: undefined,
    trailingIcon: undefined,
    ui: () => ({})
  }
)
</script>

<template>
  <UButton v-bind="{ ...$attrs, ...props }">
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>

    <slot v-if="!loading" />

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </UButton>
</template>
