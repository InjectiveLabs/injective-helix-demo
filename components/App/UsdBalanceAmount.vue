<script lang="ts" setup>
import {
  UI_AMOUNT_ABBREVIATION_FLOOR,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    amount: string | number
    shouldAbbreviate?: boolean
    isShowNoDecimals?: boolean
  }>(),
  {
    shouldAbbreviate: true
  }
)

const {
  valueToFixed: amountToFixed,
  valueToString: amountToString,
  valueToBigNumber: amountToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => props.amount),
  { decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS }
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
    <SharedUsdAmount
      v-bind="{
        isShowNoDecimals,
        shouldAbbreviate,
        amount: amountToFixed,
        abbreviationFloor: shouldAbbreviate ? UI_AMOUNT_ABBREVIATION_FLOOR : 0
      }"
    />
  </AppTooltip>
</template>
