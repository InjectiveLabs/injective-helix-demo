<script lang="ts" setup>
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    decimalPlaces?: number
    amount: string | number
    shouldTruncate?: boolean
    maxTrailingZeros?: number
    showZeroAsEmDash?: boolean
  }>(),
  {
    maxTrailingZeros: 3,
    shouldTruncate: true,
    decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
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
  <SharedAmountCollapsed
    v-bind="{
      shouldTruncate,
      showZeroAsEmDash,
      maxTrailingZeros,
      amount: amountToFixed
    }"
  />
</template>
