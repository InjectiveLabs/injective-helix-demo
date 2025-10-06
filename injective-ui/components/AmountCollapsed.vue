<script lang="ts" setup>
import { computed } from 'vue'
import { BigNumber } from '@injectivelabs/utils'
import { sharedGetExactDecimalsFromNumber } from '../utils/formatter'

const props = withDefaults(
  defineProps<{
    amount: string
    dataCyTag?: string
    shouldTruncate?: boolean
    maxTrailingZeros?: number
    showZeroAsEmDash?: boolean
  }>(),
  {
    maxTrailingZeros: 1
  }
)

const { valueToString: amountToString, valueToBigNumber: amountInBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.amount),
    {
      roundingMode: BigNumber.ROUND_DOWN,
      decimalPlaces: computed(() =>
        sharedGetExactDecimalsFromNumber(props.amount, true)
      ),
      minimalDecimalPlaces: computed(() =>
        sharedGetExactDecimalsFromNumber(props.amount, true)
      )
    }
  )

const amountWithoutTrailingZeros = computed(() => {
  if (!props.shouldTruncate) {
    return amountToString.value
  }

  if (!amountToString.value.includes('.')) {
    return amountToString.value
  }

  return amountToString.value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
})

const maxTrailingZeros = computed(
  () => '0.' + '0'.repeat(props.maxTrailingZeros)
)

// Refactor condensedZeroCount to handle negative numbers
const condensedZeroCount = computed(() => {
  const amountString = amountWithoutTrailingZeros.value
  const isNegative = amountString.startsWith('-')
  const absAmountString = isNegative ? amountString.slice(1) : amountString

  if (!absAmountString.startsWith(maxTrailingZeros.value)) {
    return 0
  }

  let condensedCount = 0

  const digitsAfterDecimal = absAmountString.replace(/^0\./, '')

  for (const num of digitsAfterDecimal) {
    if (num !== '0') {
      break
    }

    condensedCount++
  }

  return condensedCount
})

const dustAmount = computed(() => {
  const amount = amountWithoutTrailingZeros.value
  const absAmount = amount.replace('-', '')
  const zerosPattern = `^0.${'0'.repeat(condensedZeroCount.value)}`

  return absAmount.replace(new RegExp(zerosPattern), '')
})
</script>

<template>
  <span :data-cy="dataCyTag">
    <slot
      v-bind="{
        dustAmount,
        condensedZeroCount
      }"
    >
      <span v-if="showZeroAsEmDash && amountInBigNumber.eq(0)"> &mdash; </span>

      <span
        v-else-if="
          condensedZeroCount <= 1 ||
          amountInBigNumber.eq(0) ||
          amountInBigNumber.abs().gt(1)
        "
      >
        {{ amountWithoutTrailingZeros }}
      </span>

      <span v-else>
        <span class="flex items-center">
          {{ amountInBigNumber.lt(0) ? '-' : '' }}0.0
          <sub>
            {{ condensedZeroCount }}
          </sub>
          {{ dustAmount }}
        </span>
      </span>
    </slot>
  </span>
</template>
