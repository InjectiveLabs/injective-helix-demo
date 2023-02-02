<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getDecimalsBasedOnNumber } from '@/app/utils/helpers'

const props = defineProps({
  sm: Boolean,

  number: {
    required: true,
    type: Object as PropType<BigNumberInBase>
  },

  decimals: {
    required: false,
    default: UI_DEFAULT_DISPLAY_DECIMALS,
    type: Number
  },

  prefix: {
    type: String,
    default: ''
  }
})

const formattedNumberWithDecimals = computed(() => {
  return getDecimalsBasedOnNumber(props.number, props.decimals)
})

const classes = computed(() => {
  const result = ['flex', 'items-end', 'justify-center']

  if (
    formattedNumberWithDecimals.value.number.toFixed(
      formattedNumberWithDecimals.value.decimals
    ).length >
      12 + formattedNumberWithDecimals.value.decimals ||
    props.sm
  ) {
    result.push('text-sm')
  } else {
    result.push('text-xl')
  }

  return result.join(' ')
})
</script>

<template>
  <AppNumber
    :prefix="prefix"
    :number="formattedNumberWithDecimals.number"
    :decimals="formattedNumberWithDecimals.decimals"
    :class="classes"
  >
    <template #addon>
      <span class="text-sm text-gray-450 ml-1">
        <slot></slot>
      </span>
    </template>
  </AppNumber>
</template>
