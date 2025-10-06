<script lang="ts" setup>
import { computed } from 'vue'
import { BigNumber } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    amount: string
    decimalPlaces?: number
    abbreviationFloor?: number
    showZeroAsEmDash?: boolean
    showTrailingZeros?: boolean
  }>(),
  {
    decimalPlaces: 8,
    abbreviationFloor: 0
  }
)

const { valueToString: amountToString, valueToBigNumber: amountInBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.amount),
    {
      roundingMode: BigNumber.ROUND_DOWN,
      abbreviationFloor: props.abbreviationFloor,
      decimalPlaces: computed(() => props.decimalPlaces),
      minimalDecimalPlaces: computed(() => props.decimalPlaces)
    }
  )

const amountWithoutTrailingZeros = computed(() => {
  if (!amountToString.value.includes('.')) {
    return amountToString.value
  }

  return amountToString.value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
})
</script>

<template>
  <span>
    <span v-if="showZeroAsEmDash && amountInBigNumber.eq(0)"> &mdash; </span>
    <span v-else-if="showTrailingZeros">
      {{ amountToString }}
    </span>
    <span v-else>
      {{ amountWithoutTrailingZeros }}
    </span>
  </span>
</template>
