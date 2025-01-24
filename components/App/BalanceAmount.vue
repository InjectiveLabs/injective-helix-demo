<script lang="ts" setup>
import { UI_AMOUNT_ABBREVIATION_FLOOR } from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    amount: string
    decimalPlaces?: number
    shouldAbbreviate?: boolean
    showZeroAsEmDash?: boolean
  }>(),
  {
    decimalPlaces: 8,
    shouldAbbreviate: true
  }
)

const { valueToString: amountToString, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.amount),
    {
      shouldTruncate: true,
      decimalPlaces: computed(() => props.decimalPlaces)
    }
  )
</script>

<template>
  <AppTooltip
    :text="amountToString"
    :ui="{ width: 'w-auto' }"
    :is-disabled="
      !shouldAbbreviate ||
      (shouldAbbreviate && amountToBigNumber.lt(UI_AMOUNT_ABBREVIATION_FLOOR))
    "
  >
    <SharedAmountBalance
      class="inline-flex"
      v-bind="{
        amount,
        decimalPlaces,
        showZeroAsEmDash,
        abbreviationFloor: shouldAbbreviate ? UI_AMOUNT_ABBREVIATION_FLOOR : 0
      }"
    />
  </AppTooltip>
</template>
