<script setup lang="ts">
const spotStore = useSpotStore()
const market = computed(() =>
  spotStore.markets.find((market) => market.slug === 'inj-usdt')
)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }"> </PartialsTradeLayout>
</template>
