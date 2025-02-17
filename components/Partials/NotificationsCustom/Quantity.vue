<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    quantity: string
  }>(),
  {}
)

const [quantity, decimals] = props.quantity.split('-')
</script>

<template>
  <AppAmount
    v-bind="{
      amount: quantity,
      decimalPlaces: Number(decimals)
    }"
    class="inline-block mr-0.25"
  />
</template>
