<script setup lang="ts">
const spotStore = useSpotStore()
const market = computed(() =>
  spotStore.markets.find((market) => market.slug === 'inj-usdt')
)

const result = useOrderbook(
  computed(() => market.value),
  true
)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }" is-spot>
    <template #form>
      {{ result }}
    </template>
  </PartialsTradeLayout>
</template>
