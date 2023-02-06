<script lang="ts" setup>
import {
  MarketType,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityFetchOptions, Modal, UiMarketWithToken } from '@/types'

const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const { $onError } = useNuxtApp()

const filterByCurrentMarket = ref(false)
const market = ref<UiDerivativeMarketWithToken | undefined>(undefined)
const marketIsExpired = ref(false)
const fetchStatus = reactive(new Status(StatusType.Loading))

onWalletConnected(() => {
  filterByCurrentMarket.value = false
  refreshSubaccountDetails()
})

function onLoad(pageMarket: UiMarketWithToken) {
  filterByCurrentMarket.value = false

  const derivativeMarket = pageMarket as UiDerivativeMarketWithToken

  Promise.all([
    derivativeStore.streamTrades(derivativeMarket.marketId),
    derivativeStore.streamOrderbook(derivativeMarket.marketId),
    derivativeStore.streamMarketsMarkPrices(),
    derivativeStore.getMarketMarkPrice(derivativeMarket)
  ]).catch($onError)

  market.value = derivativeMarket
  refreshSubaccountDetails()
  checkMarketIsExpired(derivativeMarket)
}

function checkMarketIsExpired(market: UiDerivativeMarketWithToken) {
  if (market.subType !== MarketType.Futures) {
    return false
  }

  const expiryFuturesMarket = market as UiExpiryFuturesMarketWithToken

  if (!expiryFuturesMarket.expiryFuturesMarketInfo) {
    return false
  }

  marketIsExpired.value =
    expiryFuturesMarket.expiryFuturesMarketInfo.expirationTimestamp <=
    Date.now() / 1000

  if (marketIsExpired) {
    modalStore.openModal({ type: Modal.MarketExpired })
  }
}

function refreshSubaccountDetails() {
  if (!market.value) {
    return
  }

  derivativeStore.cancelSubaccountStream()

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
    derivativeStore.fetchSubaccountOrders(marketIds),
    derivativeStore.fetchSubaccountOrderHistory(fetchOptions),
    derivativeStore.fetchSubaccountConditionalOrders(marketIds),
    derivativeStore.fetchSubaccountTrades(fetchOptions),
    positionStore.fetchSubaccountPositions(fetchOptions)
  ])
    .catch($onError)
    .finally(() => fetchStatus.setIdle())
}

function streamSubaccountOrderDetails(marketId?: string) {
  Promise.all([
    positionStore.streamSubaccountPositions(marketId),
    derivativeStore.streamSubaccountOrders(marketId),
    derivativeStore.streamSubaccountOrderHistory(marketId),
    derivativeStore.streamSubaccountTrades(marketId)
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
</script>

<template>
  <PartialsTradingLayout @loaded="onLoad">
    <template #trading-form>
      <PartialsTradingDerivativesTradingForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsTradingDerivativesOrders
        v-if="market"
        v-model:filterByCurrentMarket="filterByCurrentMarket"
        :market="market"
        :status="fetchStatus"
        @update:filter-by-current-market="refreshSubaccountDetails"
      />
    </template>

    <template #modals>
      <div>
        <ModalsAddMargin />
        <ModalsMarketExpired
          v-if="market && marketIsExpired"
          :market="market"
        />
      </div>
    </template>
  </PartialsTradingLayout>
</template>
