<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityFetchOptions, UiMarketWithToken } from '@/types'
import { notLiquidMarkets } from '@/app/data/market'
import {
  SpotTradeIntegrityStrategy,
  SpotOrderbookIntegrityStrategy,
  SpotSubaccountOrderIntegrityStrategy,
  SpotSubaccountTradeIntegrityStrategy
} from '@/app/client/streams/data-integrity/strategies'

definePageMeta({
  middleware: ['markets', 'grid-strategy-subaccount']
})

const spotStore = useSpotStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()

const { $onError } = useNuxtApp()

const filterByCurrentMarket = ref(false)
const market = ref<UiSpotMarketWithToken | undefined>(undefined)
const fetchStatus = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  filterByCurrentMarket.value = false
  refreshSubaccountDetails()
})

const notLiquidMarket = computed(() =>
  notLiquidMarkets.find((m) => m.slug === market.value?.slug)
)

function onLoad(pageMarket: UiMarketWithToken) {
  filterByCurrentMarket.value = false

  Promise.all([
    spotStore.streamTrades(pageMarket.marketId),
    spotStore.streamOrderbookUpdate(pageMarket.marketId)
  ]).catch($onError)

  market.value = pageMarket as UiSpotMarketWithToken
  refreshSubaccountDetails()
}

function refreshSubaccountDetails() {
  if (!market.value) {
    return
  }

  spotStore.cancelSubaccountStream()

  const fetchOptions = filterByCurrentMarket.value
    ? {
        filters: {
          marketIds: [market.value.marketId]
        }
      }
    : undefined
  const marketId = filterByCurrentMarket.value
    ? market.value.marketId
    : undefined

  fetchSubaccountOrderDetails(fetchOptions)
  streamSubaccountOrderDetails(marketId)
}

function fetchSubaccountOrderDetails(fetchOptions?: ActivityFetchOptions) {
  fetchStatus.setLoading()

  const marketIds = fetchOptions?.filters?.marketIds

  Promise.all([
    spotStore.fetchSubaccountOrders(marketIds),
    spotStore.fetchSubaccountOrderHistory(fetchOptions),
    spotStore.fetchSubaccountTrades(fetchOptions)
  ])
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
}

function streamSubaccountOrderDetails(marketId?: string) {
  Promise.all([
    spotStore.streamSubaccountTrades(marketId),
    spotStore.streamSubaccountOrders(marketId),
    spotStore.streamSubaccountOrderHistory(marketId)
  ])
}

watch(
  () => walletStore.isUserWalletConnected,
  (isConnected: Boolean) => {
    if (isConnected) {
      fetchStatus.setLoading()
    }
  }
)

watch(
  () => accountStore.subaccountId,
  () => {
    refreshSubaccountDetails()
  }
)

useIntervalFn(() => {
  if (!market.value) {
    return
  }

  const args = filterByCurrentMarket.value ? [market.value.marketId] : undefined

  Promise.all([
    SpotSubaccountOrderIntegrityStrategy.make(args).validate(),
    SpotSubaccountTradeIntegrityStrategy.make(args).validate(),
    SpotTradeIntegrityStrategy.make(market.value.marketId).validate(),
    SpotOrderbookIntegrityStrategy.make(market.value.marketId).validate()
  ])
}, 30 * 1000)
</script>

<template>
  <PartialsTradingLayout is-spot @loaded="onLoad">
    <template #trading-form>
      <PartialsTradingSpotTradingForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsTradingSpotOrders
        v-if="market"
        v-model:filterByCurrentMarket="filterByCurrentMarket"
        :market="market"
        :status="fetchStatus"
        @update:filter-by-current-market="refreshSubaccountDetails"
      />
    </template>

    <template #modals>
      <ModalsMarketNotLiquid
        v-if="notLiquidMarket"
        v-bind="{ notLiquidMarket }"
      />
      <ModalsMarketRestricted
        v-if="market"
        :key="market.marketId"
        v-bind="{
          market,
          isSpot: true
        }"
      />
    </template>
  </PartialsTradingLayout>
</template>
