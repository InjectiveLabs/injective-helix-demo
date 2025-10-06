<script setup lang="ts">
import { abbreviateNumber } from '../../utils/helper'
import { BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_ABBREVIATION_THRESHOLD } from '../../utils/constant'

const props = withDefaults(
  defineProps<{
    decimals?: number
    useSubscript?: boolean
    noTrailingZeros?: boolean
    subscriptDecimals?: number
    abbreviationThreshold?: number
    subscriptThresholdDecimals?: number
    amount: string | number | BigNumberInBase
  }>(),
  {
    decimals: 8,
    subscriptDecimals: 4,
    subscriptThresholdDecimals: 4,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD
  }
)

const abbreviatedAmount = computed(() => {
  const amount = new BigNumberInBase(props.amount || 0)

  const nIsBiggerThanThreshold = amount.gte(props.abbreviationThreshold)

  const minDecimalThreshold = new BigNumberInBase(1).div(
    Math.pow(10, props.decimals)
  )

  const nIsLowerThanDecimalThreshold = amount.lt(minDecimalThreshold)

  if (!!props.abbreviationThreshold && nIsBiggerThanThreshold) {
    return abbreviateNumber(Number(props.amount || 0))
  }

  if (nIsLowerThanDecimalThreshold && amount.gt(0)) {
    return '<' + minDecimalThreshold.toFormat()
  }

  return false
})

const subscriptedAmount = computed(() => {
  const [integerPart, decimalPart] = new BigNumberInBase(props.amount || 0)
    .toFixed()
    .split('.')

  if (!decimalPart || !props.useSubscript) {
    return false
  }

  let nOfZeros = 0

  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === '0') {
      nOfZeros++
    } else {
      break
    }
  }

  if (
    nOfZeros > props.subscriptThresholdDecimals ||
    nOfZeros > props.decimals
  ) {
    const subscriptAmount = new BigNumberInBase(decimalPart.replace(/^0+/, ''))
      .toFixed(0)
      .slice(0, props.subscriptDecimals)

    const integerAmount = new BigNumberInBase(integerPart).toFormat(0)

    return integerAmount + '.0<sub>' + nOfZeros + '</sub>' + subscriptAmount
  }

  return false
})

const formattedAmount = computed(() => {
  const amount = new BigNumberInBase(props.amount || 0)
  const DEFAULT_ROUNDING_MODE = BigNumberInBase.ROUND_DOWN

  if (props.noTrailingZeros) {
    return amount
      .toFormat(props.decimals, DEFAULT_ROUNDING_MODE)
      .replace(/\.?0+$/, '')
  }

  const formattedAmount = amount.toFormat(props.decimals, DEFAULT_ROUNDING_MODE)

  return formattedAmount
})
</script>

<template>
  <span v-if="abbreviatedAmount">{{ abbreviatedAmount }}</span>
  <span v-else-if="subscriptedAmount" v-html="subscriptedAmount"></span>
  <span v-else>{{ formattedAmount }}</span>
</template>
