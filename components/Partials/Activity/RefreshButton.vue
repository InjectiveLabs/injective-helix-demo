<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { ActivityPage } from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const routeName = route.name as string

const showRefreshBtn = computed(() => {
  if (routeName === ActivityPage.DerivativeOrderHistory) {
    const latestVisibleOrders = derivativeStore.subaccountOrderHistory

    if (latestVisibleOrders.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestDerivativeOrderHistory?.updatedAt || '0'
    ).gt(latestVisibleOrders[0].updatedAt)
  }

  if (routeName === ActivityPage.DerivativeTradeHistory) {
    const latestVisibleTrades = derivativeStore.subaccountTrades

    if (latestVisibleTrades.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestDerivativeTrade?.executedAt || '0'
    ).gt(latestVisibleTrades[0].executedAt)
  }

  if (routeName === ActivityPage.SpotOrderHistory) {
    const latestVisibleOrders = spotStore.subaccountOrderHistory

    if (latestVisibleOrders.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestSpotOrderHistory?.updatedAt || '0'
    ).gt(latestVisibleOrders[0].updatedAt)
  }

  if (routeName === ActivityPage.SpotTradeHistory) {
    const latestVisibleTrades = spotStore.subaccountTrades

    if (latestVisibleTrades.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestSpotTrade?.executedAt || '0'
    ).gt(latestVisibleTrades[0].executedAt)
  }
})

function handleRefresh() {
  emit('click')
}
</script>

<template>
  <AppButton
    v-if="showRefreshBtn"
    name="exchange"
    class="border-blue-500 text-blue-500 px-3"
    sm
    @click="handleRefresh"
  >
    {{
      routeName === ActivityPage.DerivativeTradeHistory ||
      routeName === ActivityPage.SpotTradeHistory
        ? $t('activity.fetchTrades')
        : $t('activity.fetchOrders')
    }}
  </AppButton>
</template>
