<script setup lang="ts">
import { BigNumberInBase } from "@injectivelabs/utils";
import { DEFAULT_ABBREVIATION_THRESHOLD } from "../../utils/constant";

const props = withDefaults(
  defineProps<{
    decimals?: number;
    useSubscript?: boolean;
    noTrailingZeros?: boolean;
    abbreviationThreshold?: number;
    amount: string | number | BigNumberInBase;
  }>(),
  {
    decimals: 8,
    noTrailingZeros: true,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD,
  },
);

const decimals = computed(() => {
  if (
    !!props.abbreviationThreshold &&
    new BigNumberInBase(props.amount || 0).gt(props.abbreviationThreshold)
  ) {
    return 2;
  }

  return props.decimals;
});
</script>

<template>
  <SharedAmountDisplay
    v-bind="{
      amount,
      decimals,
      useSubscript,
      noTrailingZeros,
      abbreviationThreshold,
    }"
  />
</template>