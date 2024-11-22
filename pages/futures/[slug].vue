<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeExecutionSide } from '@injectivelabs/ts-types'
import { rwaSlugs } from '@/app/json'
import { IsSpotKey, MarketKey } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const derivativeStore = useDerivativeStore()

const { $onError } = useNuxtApp()

const isRWAMarket = rwaSlugs.includes(route.params.slug as string)

const status = reactive(new Status(StatusType.Loading))

const market = computed(() =>
  derivativeStore.markets.find((market) => market.slug === route.params.slug)
)

useDerivativeOrderbook(computed(() => market.value))

onMounted(() => {
  if (!market.value) {
    return
  }

  status.setLoading()

  Promise.all([
    derivativeStore.fetchTrades({
      marketId: market.value.marketId,
      executionSide: TradeExecutionSide.Taker
    }),
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

provide(MarketKey, market)
provide(IsSpotKey, false)
</script>

<template>
  <div>
    <PartialsTradeLayout v-if="market" v-bind="{ market }">
      <template #form>
        <div>
          <div
            v-if="isRWAMarket"
            class="mt-4 mx-4 p-4 bg-brand-875 text-white text-xs leading-4"
          >
            <i18n-t keypath="trade.rwa.marketClosedTrade" tag="div">
              <template #marketClosedTimes>
                <NuxtLink
                  class="opacity-75 cursor-pointer text-blue-500 hover:opacity-50"
                  to="https://docs.pyth.network/price-feeds/market-hours"
                  target="_blank"
                >
                  {{ $t('trade.rwa.marketClosedTimes') }}
                </NuxtLink>
              </template>
            </i18n-t>

            <div class="mt-2">{{ $t('trade.rwa.acceptRisk') }}</div>
          </div>

          <PartialsTradeFuturesForm />
        </div>
      </template>

      <template #orders>
        <PartialsTradeFuturesOrders />
      </template>
    </PartialsTradeLayout>

    <ModalsMarketRestricted v-if="market" v-bind="{ market }" />
  </div>
</template>
