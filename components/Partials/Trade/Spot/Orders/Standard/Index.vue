<script lang="ts" setup>
import { UiSpotMarket, SpotOrdersStandardView, SpotMarketCyTags } from '@/types'

const props = withDefaults(
  defineProps<{
    market: UiSpotMarket
  }>(),
  {}
)

const spotStore = useSpotStore()
const { $onError } = useNuxtApp()

const isTickerOnly = ref(false)
const view = ref(SpotOrdersStandardView.Orders)

const filteredOrders = computed(() =>
  spotStore.subaccountOrders.filter((order) => {
    if (isTickerOnly.value) {
      return order.marketId === props.market.marketId
    }

    return true
  })
)

function refreshData() {
  const marketId = isTickerOnly.value ? props.market.marketId : undefined
  const filters = marketId ? { filters: { marketIds: [marketId] } } : undefined

  spotStore.cancelSubaccountStream()

  Promise.all([
    spotStore.fetchSubaccountTrades(filters),
    spotStore.fetchSubaccountOrderHistory(filters),
    spotStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  ]).catch($onError)

  spotStore.streamSubaccountOrders({
    marketId,
    onResetCallback: () =>
      spotStore.fetchSubaccountOrders(marketId ? [marketId] : undefined)
  })
  spotStore.streamSubaccountTrades({
    marketId,
    onResetCallback: () => spotStore.fetchSubaccountTrades(filters)
  })
  spotStore.streamSubaccountOrderHistory({
    marketId,
    onResetCallback: () => spotStore.fetchSubaccountOrderHistory(filters)
  })
}

onSubaccountChange(refreshData)

onUnmounted(() => {
  spotStore.cancelSubaccountStream()
  spotStore.resetSubaccount()
})
</script>

<template>
  <PartialsTradeSpotOrdersStandardHeader
    v-model="view"
    v-model:is-ticker-only="isTickerOnly"
    @update:is-ticker-only="refreshData"
  />

  <div
    class="w-full h-screenMinusHeader"
    :data-cy="dataCyTag(SpotMarketCyTags.OrderDetailsTable)"
  >
    <div class="overflow-x-auto divide-y h-full">
      <PartialsTradeCommonOrdersBalances
        v-if="view === SpotOrdersStandardView.Balances"
      />

      <template v-if="view === SpotOrdersStandardView.Orders">
        <PartialsPortfolioOrdersSpotOpenOrdersTable
          v-if="filteredOrders.length"
          :orders="filteredOrders"
        />

        <CommonEmptyList
          v-if="!filteredOrders.length"
          v-bind="{ message: $t('trade.noOrders') }"
        />
      </template>

      <template v-else-if="view === SpotOrdersStandardView.OrderHistory">
        <PartialsPortfolioOrdersSpotOrderHistoryTable
          v-if="spotStore.subaccountOrderHistory.length"
          :orders="spotStore.subaccountOrderHistory"
        />

        <CommonEmptyList
          v-if="!spotStore.subaccountOrderHistory.length"
          v-bind="{ message: $t('trade.noOrders') }"
        />
      </template>

      <template v-else-if="view === SpotOrdersStandardView.TradeHistory">
        <PartialsPortfolioOrdersSpotTradeHistoryTable
          v-if="spotStore.subaccountTrades.length"
          :trades="spotStore.subaccountTrades"
        />

        <CommonEmptyList
          v-if="!spotStore.subaccountTrades.length"
          v-bind="{ message: $t('trade.noTrades') }"
        />
      </template>
    </div>
  </div>
</template>
