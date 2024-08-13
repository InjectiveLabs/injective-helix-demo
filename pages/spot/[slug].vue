<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { MarketKey, IsSpotKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find((market) => market.slug === route.params.slug)
)

useSpotOrderbook(computed(() => market.value))

onMounted(() => {
  if (!market.value) {
    return
  }

  status.setLoading()

  Promise.all([
    spotStore.fetchTrades({
      marketId: market.value.marketId,
      executionSide: TradeExecutionSide.Taker
    })
  ])
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

provide(MarketKey, market)
provide(IsSpotKey, true)
</script>

<template>
  <div>
    <PartialsTradeLayout v-if="market" v-bind="{ market }" is-spot>
      <template #form>
        <PartialsTradeSpotForm />
      </template>

      <template #orders>
        <PartialsTradeSpotOrders />
      </template>
    </PartialsTradeLayout>

    <ModalsMarketRestricted v-if="market" v-bind="{ market, isSpot: true }" />
  </div>
</template>
