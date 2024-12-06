<script setup lang="ts">
import {
  MarketKey,
  TradingInterface,
  UiDerivativeMarket,
  PerpOrdersStandardView
} from '@/types'

const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const market = inject(MarketKey) as Ref<UiDerivativeMarket>
const tradingMode = useQueryRef('interface', TradingInterface.Standard)

const isTickerOnly = ref(false)
const view = ref(PerpOrdersStandardView.OpenPositions)

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
    derivativeStore.fetchSubaccountConditionalOrders([market.value.marketId]),
    positionStore.fetchSubaccountPositions({
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
    <PartialsTradeFuturesOrdersStandardHeader
      v-model:is-ticker-only="isTickerOnly"
      v-model="view"
      @update:is-ticker-only="fetchDerivativeOrders"
    />

    <div class="overflow-x-auto w-full">
      <div class="lg:min-w-[1600px]">
        <PartialsTradeFuturesOrdersStandard
          v-if="tradingMode === TradingInterface.Standard"
          v-bind="{ view, isTickerOnly }"
        />

        <PartialsTradeFuturesOrdersTradingBots v-else />
      </div>
    </div>
  </div>
</template>
