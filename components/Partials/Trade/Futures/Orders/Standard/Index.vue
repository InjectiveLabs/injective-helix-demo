<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import {
  PerpOrdersStandardView,
  UiDerivativeMarket,
  derivativeMarketKey
} from '@/types'

const accountStore = useAccountStore()
const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const isTickerOnly = ref(false)
const view = ref(PerpOrdersStandardView.OpenPositions)
const status = reactive(new Status(StatusType.Loading))

function fetchDerivativeOrders() {
  if (!accountStore.subaccountId) {
    return
  }

  status.setLoading()

  streamDerivativeOrders()

  Promise.all([
    derivativeStore.fetchSubaccountOrders(
      isTickerOnly.value ? [market.value.marketId] : undefined
    ),
    derivativeStore.fetchSubaccountOrderHistory({
      subaccountId: accountStore.subaccountId,
      filters: {
        marketIds: isTickerOnly.value
          ? [market?.value?.marketId || '']
          : undefined
      }
    }),
    derivativeStore.fetchSubaccountTrades({
      subaccountId: accountStore.subaccountId,
      filters: {
        marketIds: isTickerOnly.value
          ? [market?.value?.marketId || '']
          : undefined
      }
    }),
    derivativeStore.fetchSubaccountConditionalOrders([market.value.marketId]),
    positionStore.fetchSubaccountPositions({
      subaccountId: accountStore.subaccountId,
      filters: {
        marketIds: isTickerOnly.value
          ? [market?.value?.marketId || '']
          : undefined
      }
    })
  ])
}

function streamDerivativeOrders() {
  derivativeStore.cancelStreams()

  derivativeStore.streamSubaccountOrders(market.value.marketId)
  derivativeStore.streamSubaccountOrderHistory(market.value.marketId)
  derivativeStore.streamSubaccountTrades(market.value.marketId)
}

watch(() => [accountStore.subaccountId, market.value], fetchDerivativeOrders, {
  immediate: true
})
</script>

<template>
  <div>
    <div class="border-b">
      <PartialsTradeFuturesOrdersStandardHeader
        v-model:is-ticker-only="isTickerOnly"
        v-model="view"
        @update:is-ticker-only="fetchDerivativeOrders"
      />

      <PartialsTradeCommonOrdersBalances
        v-if="view === PerpOrdersStandardView.Balances"
      />

      <PartialsTradeFuturesOrdersStandardPositions
        v-else-if="view === PerpOrdersStandardView.OpenPositions"
      />

      <PartialsTradeFuturesOrdersStandardOpenOrders
        v-else-if="view === PerpOrdersStandardView.OpenOrders"
        v-bind="{ isTickerOnly }"
      />

      <PartialsTradeFuturesOrdersStandardTriggers
        v-else-if="view === PerpOrdersStandardView.Triggers"
      />

      <PartialsTradeFuturesOrdersStandardOrderHistory
        v-else-if="view === PerpOrdersStandardView.OrderHistory"
      />

      <PartialsTradeFuturesOrdersStandardTradeHistory
        v-else-if="view === PerpOrdersStandardView.TradeHistory"
      />
    </div>
  </div>
</template>
