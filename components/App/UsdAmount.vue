<script lang="ts" setup>
import {
  MAX_QUOTE_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    decimalPlaces?: number
    amount: string | number
    shouldTruncate?: boolean
    maxTrailingZeros?: number
    isShowNoDecimals?: boolean
  }>(),
  {
    shouldTruncate: false,
    maxTrailingZeros: MAX_QUOTE_DECIMALS,
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const { valueToFixed: amountToFixed } = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
    decimalPlaces: computed(() => props.decimalPlaces)
  }
)
</script>

<template>
  <SharedUsdAmount
    v-bind="{
      shouldTruncate,
      isShowNoDecimals,
      maxTrailingZeros,
      amount: amountToFixed
    }"
  />
</template>
