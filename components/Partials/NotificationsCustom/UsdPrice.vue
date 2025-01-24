<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    usdPrice: string
  }>(),
  {}
)

const [usdPrice, decimals] = props.usdPrice.split('-')
</script>

<template>
  <AppUsdAmount
    v-bind="{
      amount: usdPrice,
      decimalPlaces: Number(decimals)
    }"
    class="inline-block -ml-0.25"
  />
</template>
