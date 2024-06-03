<script setup lang="ts">
import { UiDerivativeMarket, DerivativeMarketKey } from '@/types'

const derivativeStore = useDerivativeStore()
const isMobile = useIsMobile()

const props = defineProps({
  isTickerOnly: Boolean
})

const derivativeMarket = inject(DerivativeMarketKey) as Ref<UiDerivativeMarket>

const filteredOrders = computed(() =>
  derivativeStore.subaccountOrders.filter((order) => {
    if (props.isTickerOnly) {
      return order.marketId === derivativeMarket.value.marketId
    }

    return true
  })
)
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersFuturesOpenOrdersTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersFuturesOpenOrdersTableMobileRow
        v-for="order in filteredOrders"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersFuturesOpenOrdersTableRow
        v-for="order in filteredOrders"
        :key="`${order.orderHash}-${order.cid}`"
        v-bind="{ order }"
      />
    </template>

    <CommonEmptyList
      v-if="filteredOrders.length === 0"
      :message="'No Open Orders'"
    />
  </div>
</template>
