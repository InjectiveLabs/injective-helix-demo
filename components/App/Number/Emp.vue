<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { getDecimalsBasedOnNumber } from '@/app/utils/helpers'

const props = withDefaults(
  defineProps<{
    isSm?: boolean
    number: BigNumberInBase
    prefix?: string
    decimals?: number
  }>(),
  {
    isSm: false,
    prefix: '',
    decimals: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const formattedNumberWithDecimals = computed(() =>
  getDecimalsBasedOnNumber(props.number, props.decimals)
)

const classes = computed(() => {
  const result = ['flex', 'items-end', 'justify-center']

  const formattedNumber = formattedNumberWithDecimals.value.number.toFormat(
    formattedNumberWithDecimals.value.decimals
  )

  if (
    formattedNumber.length > 12 + formattedNumberWithDecimals.value.decimals ||
    props.isSm
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
      <span class="text-sm text-coolGray-450 ml-1">
        <slot />
      </span>
    </template>
  </AppNumber>
</template>
