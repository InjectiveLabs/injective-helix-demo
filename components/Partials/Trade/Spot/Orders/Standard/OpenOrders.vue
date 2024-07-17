<script setup lang="ts">
import { MarketKey, UiSpotMarket } from '@/types'

const props = defineProps({
  isTickerOnly: Boolean
})

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()

const isMobile = useIsMobile()

const filteredOrders = computed(() =>
  spotStore.subaccountOrders.filter((order) => {
    if (props.isTickerOnly) {
      return order.marketId === spotMarket.value.marketId
    }

    return true
  })
)
</script>

<template>
  <div class="divide-y">
    <PartialsPortfolioOrdersSpotOpenOrdersTableHeader v-if="!isMobile" />

    <div v-if="isMobile">
      <PartialsPortfolioOrdersSpotOpenOrdersTableMobileRow
        v-for="order in filteredOrders"
        :key="order.orderHash"
        v-bind="{ order }"
      />
    </div>

    <template v-else>
      <PartialsPortfolioOrdersSpotOpenOrdersTableRow
        v-for="order in filteredOrders"
        :key="order.orderHash"
        v-bind="{ order }"
      />
    </template>

    <CommonEmptyList
      v-if="filteredOrders.length === 0"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
