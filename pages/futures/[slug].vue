<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { derivativeMarketKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Loading))
const { $onError } = useNuxtApp()

const market = computed(() =>
  derivativeStore.markets.find((market) => market.slug === route.params.slug)
)

useOrderbook(
  computed(() => market.value),
  false
)

provide(derivativeMarketKey, market)

onMounted(() => {
  if (!market.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .fetchTrades({ marketId: market.value.marketId })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})
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
