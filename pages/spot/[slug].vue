<script setup lang="ts">
import { spotMarketKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const spotStore = useSpotStore()

const market = computed(() =>
  spotStore.markets.find((market) => market.slug === route.params.slug)
)

useOrderbook(
  computed(() => market.value),
  true
)

provide(spotMarketKey, market)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }" is-spot>
    <template #form>
      <PartialsTradeSpotForm />
    </template>

    <template #orders>
      <PartialsTradeSpotOrders />
    </template>
  </PartialsTradeLayout>
</template>
