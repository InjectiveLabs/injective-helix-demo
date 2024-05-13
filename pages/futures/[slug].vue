<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { derivativeMarketKey, isSpotKey, marketKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

useDerivativeOrderbook(computed(() => market.value))

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  derivativeStore.markets.find((market) => market.slug === route.params.slug)
)

onMounted(() => {
  if (!market.value) {
    return
  }

  status.setLoading()

  Promise.all([
    derivativeStore.fetchTrades({ marketId: market.value.marketId }),
    derivativeStore.getMarketMarkPrice(market.value)
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })

  streamDerivativeData()
})

onUnmounted(() => {
  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
  derivativeStore.reset()
})

function streamDerivativeData() {
  if (!market.value) {
    return
  }

  cancelDerivativeStream()

  derivativeStore.streamTrades(market.value.marketId)
  derivativeStore.streamMarketsMarkPrices()
}

function cancelDerivativeStream() {
  derivativeStore.cancelTradesStream()
  derivativeStore.cancelMarketsMarkPrices()
}

provide(derivativeMarketKey, market)
provide(marketKey, market)
provide(isSpotKey, false)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }">
    <template #form>
      <PartialsTradeFuturesForm />
    </template>

    <template #orders>
      <PartialsTradeFuturesOrders />
    </template>
  </PartialsTradeLayout>
</template>
