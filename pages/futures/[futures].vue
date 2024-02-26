<script setup lang="ts">
const derivativeStore = useDerivativeStore()
const market = computed(() =>
  derivativeStore.markets.find((market) => market.slug === 'btc-usdt-perp')
)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }"> </PartialsTradeLayout>
</template>
