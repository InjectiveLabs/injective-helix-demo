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

const view = ref(PerpOrdersStandardView.OpenPositions)
const status = reactive(new Status(StatusType.Loading))

function fetchDerivativeOrders() {
  if (!accountStore.subaccountId) {
    return
  }

  status.setLoading()

  streamDerivativeOrders()

  Promise.all([
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountOrderHistory({
      subaccountId: accountStore.subaccountId
    }),
    derivativeStore.fetchSubaccountTrades({
      subaccountId: accountStore.subaccountId
    }),
    derivativeStore.fetchSubaccountConditionalOrders([market.value.marketId]),
    positionStore.fetchSubaccountPositions({
      subaccountId: accountStore.subaccountId,
      filters: {
        marketIds: [market?.value?.marketId || '']
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
    <PartialsTradeFuturesOrdersStandardHeader v-model="view" />

    <div class="overflow-x-auto border-b max-h-lg">
      <div class="min-w-[1400px]">
        <PartialsTradeCommonOrdersBalances
          v-if="view === PerpOrdersStandardView.Balances"
        />

        <PartialsTradeFuturesOrdersStandardPositions
          v-else-if="view === PerpOrdersStandardView.OpenPositions"
        />

        <PartialsTradeFuturesOrdersStandardOpenOrders
          v-else-if="view === PerpOrdersStandardView.OpenOrders"
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
  </div>
</template>
