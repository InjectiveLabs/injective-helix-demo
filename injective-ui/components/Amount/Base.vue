<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { abbreviateNumber } from '../../utils/helper'
import {
  DEFAULT_DISPLAY_DECIMALS,
  DEFAULT_SUBSCRIPT_DECIMALS,
  DEFAULT_ABBREVIATION_THRESHOLD,
  DEFAULT_SUBSCRIPT_THRESHOLD_DECIMALS
} from '../../utils/constant'

const props = withDefaults(
  defineProps<{
    dataCy?: string
    cyValue?: string
    decimals?: number
    useSubscript?: boolean
    noTrailingZeros?: boolean
    subscriptDecimals?: number
    shouldAbbreviate?: boolean
    showZeroAsEmDash?: boolean
    abbreviationThreshold?: number
    subscriptThresholdDecimals?: number
    roundingMode?: BigNumber.RoundingMode
    amount: string | number | BigNumberInBase
  }>(),
  {
    decimals: DEFAULT_DISPLAY_DECIMALS,
    roundingMode: BigNumber.ROUND_DOWN,
    subscriptDecimals: DEFAULT_SUBSCRIPT_DECIMALS,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD,
    subscriptThresholdDecimals: DEFAULT_SUBSCRIPT_THRESHOLD_DECIMALS
  }
)

const amountToBigNumber = computed(() => new BigNumberInBase(props.amount || 0))
const isNegative = computed(() => amountToBigNumber.value.lt(0))
const absoluteAmount = computed(() => amountToBigNumber.value.abs())

const minDecimalThreshold = computed(() =>
  new BigNumberInBase(1).div(Math.pow(10, props.decimals))
)

const shouldHaveSmallerThan = computed(() => {
  const amount = absoluteAmount.value
  const nIsLowerThanDecimalThreshold = amount.lt(minDecimalThreshold.value)

  return nIsLowerThanDecimalThreshold && amount.gt(0) && !props.useSubscript
})

const abbreviatedAmount = computed(() => {
  if (!props.shouldAbbreviate) {
    return false
  }

  const amount = absoluteAmount.value

  const nIsBiggerThanThreshold = amount.gte(props.abbreviationThreshold)

  if (!!props.abbreviationThreshold && nIsBiggerThanThreshold) {
    return abbreviateNumber(amount.toNumber())
  }

  return false
})

const subscriptedAmount = computed(() => {
  const [integerPart, decimalPart] = absoluteAmount.value.toFixed().split('.')

  if (!decimalPart || !props.useSubscript || absoluteAmount.value.gte(1)) {
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
    nOfZeros >= props.decimals ||
    nOfZeros > props.subscriptThresholdDecimals
  ) {
    let subscriptAmount = new BigNumberInBase(decimalPart.replace(/^0+/, ''))
      .toFixed(0)
      .slice(0, props.subscriptDecimals)

    if (!props.noTrailingZeros) {
      subscriptAmount = subscriptAmount.padEnd(props.subscriptDecimals, '0')
    }

    const integerAmount = new BigNumberInBase(integerPart).toFormat(0)

    return integerAmount + '.0<sub>' + nOfZeros + '</sub>' + subscriptAmount
  }

  return false
})

const formattedAmount = computed(() => {
  const amount = absoluteAmount.value
  const decimals = !props.shouldAbbreviate &&  amountToBigNumber.value.gte(DEFAULT_ABBREVIATION_THRESHOLD) ? 0 : props.decimals

  if (props.noTrailingZeros && props.decimals > 0) {
    const result = amount
      .toFormat(decimals, props.roundingMode)
      .replace(/(\.\d*?[1-9])0+$/g, '$1')
      .replace(/\.0+$/, '')

    return result || '0'
  }

  return amount.toFormat(decimals, props.roundingMode)
})
</script>

<template>
  <span :data-cy="props.dataCy" :cy-value="props.cyValue">
    <span v-if="isNegative">-</span>
    <slot name="prefix" />

    <span v-if="showZeroAsEmDash && amountToBigNumber.isZero()"> &mdash; </span>
    <span v-else-if="subscriptedAmount" v-html="subscriptedAmount" />
    <span v-else-if="shouldHaveSmallerThan"
      >&lt;{{ minDecimalThreshold.toFormat() }}
    </span>
    <span v-else-if="abbreviatedAmount">{{ abbreviatedAmount }}</span>
    <span v-else>{{ formattedAmount }}</span>
  </span>
</template>
