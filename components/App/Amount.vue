<script lang="ts" setup>
import {
  MAX_QUOTE_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    decimalPlaces?: number
    amount: string | number
    shouldTruncate?: boolean
    maxTrailingZeros?: number
    showZeroAsEmDash?: boolean
  }>(),
  {
    maxTrailingZeros: MAX_QUOTE_DECIMALS,
    shouldTruncate: true,
    decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  }
)

const minimumAmount = computed(() =>
  props.decimalPlaces === 0 ? '0' : `0.${'0'.repeat(props.decimalPlaces - 1)}1`
)

const { valueToFixed: amountToFixed, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.amount),
    { decimalPlaces: computed(() => props.decimalPlaces) }
  )
</script>

<template>
  <SharedAmountCollapsed
    v-if="
      amountToBigNumber.isZero() ||
      amountToBigNumber.isNegative() ||
      amountToBigNumber.gte(minimumAmount)
    "
    class="inline-flex"
    v-bind="{
      shouldTruncate,
      showZeroAsEmDash,
      maxTrailingZeros,
      amount: amountToFixed
    }"
  />
  <span v-else> &lt; {{ minimumAmount }} </span>
</template>
