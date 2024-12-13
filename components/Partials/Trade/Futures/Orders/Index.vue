<script setup lang="ts">
import { helixTopHeaderHeight } from '@/app/data/trade'
import {
  MarketKey,
  TradingInterface,
  UiDerivativeMarket,
  PerpOrdersStandardView
} from '@/types'

const accountStore = useAccountStore()
const positionStore = usePositionStore()
const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()
const market = inject(MarketKey) as Ref<UiDerivativeMarket>
const tradingMode = useQueryRef('interface', TradingInterface.Standard)

const isTickerOnly = ref(false)
const view = ref(PerpOrdersStandardView.Positions)

function fetchDerivativeOrders() {
  if (!accountStore.subaccountId) {
    return
  }

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
    derivativeStore.fetchSubaccountConditionalOrders(
      isTickerOnly.value ? [market?.value?.marketId || ''] : undefined
    ),
    positionStore.fetchSubaccountPositions({
      filters: {
        marketIds: isTickerOnly.value
          ? [market?.value?.marketId || '']
          : undefined
      }
    }),
    activityStore.fetchSubaccountFundingHistory({
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
  <div class="h-full">
    <PartialsTradeFuturesOrdersStandardHeader
      v-model="view"
      v-model:is-ticker-only="isTickerOnly"
      @update:is-ticker-only="fetchDerivativeOrders"
    />

    <div :class="`w-full h-[calc(100%-${helixTopHeaderHeight}px)]`">
      <PartialsTradeFuturesOrdersStandard
        v-if="tradingMode === TradingInterface.Standard"
        v-bind="{ view, isTickerOnly }"
      />

      <PartialsTradeFuturesOrdersTradingBots v-else />
    </div>
  </div>
</template>
