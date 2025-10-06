<script lang="ts" setup>
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  DEFAULT_ASSET_DECIMALS,
  DEFAULT_ABBREVIATED_DECIMALS,
  DEFAULT_ABBREVIATION_THRESHOLD
} from '../../utils/constant'

const props = withDefaults(
  defineProps<{
    dataCy?: string
    cyValue?: string
    decimals?: number
    useSubscript?: boolean
    noTrailingZeros?: boolean
    shouldAbbreviate?: boolean
    showZeroAsEmDash?: boolean
    abbreviationThreshold?: number
    roundingMode?: BigNumber.RoundingMode
    amount: string | number | BigNumberInBase
  }>(),
  {
    noTrailingZeros: true,
    shouldAbbreviate: true,
    decimals: DEFAULT_ASSET_DECIMALS,
    roundingMode: BigNumber.ROUND_DOWN,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD
  }
)

const decimals = computed(() => {
  if (
    props.shouldAbbreviate &&
    !!props.abbreviationThreshold &&
    new BigNumberInBase(props.amount || 0).gt(props.abbreviationThreshold)
  ) {
    return DEFAULT_ABBREVIATED_DECIMALS
  }

  return props.decimals
})
</script>

<template>
  <SharedAmountBase
    v-bind="{
      amount,
      dataCy,
      cyValue,
      decimals,
      roundingMode,
      useSubscript,
      noTrailingZeros,
      shouldAbbreviate,
      showZeroAsEmDash,
      abbreviationThreshold
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
