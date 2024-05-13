<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { isSpotKey, marketKey, spotMarketKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

useSpotOrderbook(computed(() => market.value))

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find((market) => market.slug === route.params.slug)
)

onMounted(() => {
  if (!market.value) {
    return
  }

  status.setLoading()

  spotStore
    .fetchTrades({ marketId: market.value.marketId })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  spotStore.streamTrades(market.value.marketId)
})

onUnmounted(() => {
  spotStore.cancelTradesStream()
  spotStore.reset()
})

provide(spotMarketKey, market)
provide(marketKey, market)
provide(isSpotKey, true)
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
