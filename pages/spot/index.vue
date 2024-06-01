<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { isSpotKey, marketKey, spotMarketKey } from '@/types'

// permissionless spot market

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  spotStore.markets.find((market) => market.marketId === route.query.marketId)
)

useSpotOrderbook(computed(() => market.value))

onMounted(() => {
  if (!market.value) {
    return navigateTo({ name: 'spot-slug', params: { slug: 'inj-usdt' } })
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

provide(marketKey, market)
provide(spotMarketKey, market)
provide(isSpotKey, true)
</script>

<template>
  <div v-if="market">
    <PartialsTradeLayout v-bind="{ market }" is-spot>
      <template #form>
        <PartialsTradeSpotForm />
      </template>

      <template #orders>
        <PartialsTradeSpotOrders />
      </template>
    </PartialsTradeLayout>

    <ModalsMarketNotOnHelix v-if="!market.isVerified" />
  </div>
</template>
