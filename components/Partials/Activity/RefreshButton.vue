<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { ActivitySubPage } from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()

const emit = defineEmits<{
  click: []
}>()

const routeName = route.name as string

const isRefreshButtonVisible = computed(() => {
  if (routeName === ActivitySubPage.DerivativesOrderHistory) {
    const latestVisibleOrders = derivativeStore.subaccountOrderHistory

    if (latestVisibleOrders.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestDerivativeOrderHistory?.updatedAt || '0'
    ).gt(latestVisibleOrders[0].updatedAt)
  }

  if (routeName === ActivitySubPage.DerivativesTradeHistory) {
    const latestVisibleTrades = derivativeStore.subaccountTrades

    if (latestVisibleTrades.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestDerivativeTrade?.executedAt || '0'
    ).gt(latestVisibleTrades[0].executedAt)
  }

  if (routeName === ActivitySubPage.SpotOrderHistory) {
    const latestVisibleOrders = spotStore.subaccountOrderHistory

    if (latestVisibleOrders.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestSpotOrderHistory?.updatedAt || '0'
    ).gt(latestVisibleOrders[0].updatedAt)
  }

  if (routeName === ActivitySubPage.SpotTradeHistory) {
    const latestVisibleTrades = spotStore.subaccountTrades

    if (latestVisibleTrades.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestSpotTrade?.executedAt || '0'
    ).gt(latestVisibleTrades[0].executedAt)
  }
})

function onRefresh() {
  emit('click')
}
</script>

<template>
  <AppButton
    v-if="isRefreshButtonVisible"
    name="exchange"
    class="border-blue-500 text-blue-500 px-3"
    is-sm
    @click="onRefresh"
  >
    {{
      routeName === ActivitySubPage.DerivativesTradeHistory ||
      routeName === ActivitySubPage.SpotTradeHistory
        ? $t('activity.fetchTrades')
        : $t('activity.fetchOrders')
    }}
  </AppButton>
</template>
