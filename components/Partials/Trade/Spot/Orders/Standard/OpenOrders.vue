<script setup lang="ts">
import { MarketKey, UiSpotMarket } from '@/types'

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
  }>(),
  {
    isTickerOnly: false
  }
)

const spotMarket = inject(MarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()

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
    <PartialsPortfolioOrdersSpotOpenOrdersTable
      v-if="filteredOrders.length"
      :orders="filteredOrders"
    />

    <CommonEmptyList
      v-if="!filteredOrders.length"
      v-bind="{ message: 'No Orders' }"
    />
  </div>
</template>
