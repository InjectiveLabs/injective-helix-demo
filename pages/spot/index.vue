<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { MarketKey, IsSpotKey } from '@/types'

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
    .fetchTrades({
      marketId: market.value.marketId,
      executionSide: TradeExecutionSide.Taker
    })
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

provide(IsSpotKey, true)
provide(MarketKey, market)
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
