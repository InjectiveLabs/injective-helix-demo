<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { isCountryRestrictedForPerpetualMarkets } from '@/app/data/geoip'
import { IsSpotKey, MarketKey, Modal } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const appStore = useAppStore()
const modalStore = useModalStore()
const route = useRoute()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  derivativeStore.markets.find(
    (market) => market.marketId === route.query.marketId
  )
)

useDerivativeOrderbook(computed(() => market.value))

onMounted(() => {
  if (!market.value) {
    return navigateTo({
      name: 'futures-slug',
      params: { slug: 'btc-usdt-perp' }
    })
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

  if (
    isCountryRestrictedForPerpetualMarkets(
      appStore.userState.geoLocation.browserCountry ||
        appStore.userState.geoLocation.country
    )
  ) {
    modalStore.openModal(Modal.MarketRestricted)
  }

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

provide(MarketKey, market)
provide(IsSpotKey, false)
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

  <ModalsMarketRestricted v-if="market" v-bind="{ market }" />
</template>
