<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { spotMarketKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const spotStore = useSpotStore()
const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

const market = computed(() =>
  spotStore.markets.find((market) => market.marketId === route.query.marketId)
)

useOrderbook(
  computed(() => market.value),
  true
)

provide(spotMarketKey, market)

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
})

onMounted(() => {
  if (!market.value) {
    navigateTo({ name: 'spot-slug', params: { slug: 'inj-usdt' } })
  }
})
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
