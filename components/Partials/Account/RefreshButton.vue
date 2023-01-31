<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { ActivityView } from '@/types'

const activityStore = useActivityStore()
const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

const props = defineProps({
  view: {
    type: String as PropType<ActivityView>,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const showRefreshBtn = computed(() => {
  if (props.view === ActivityView.DerivativeOrderHistory) {
    const latestVisibleOrders = derivativeStore.subaccountOrderHistory

    if (latestVisibleOrders.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestDerivativeOrderHistory?.updatedAt || '0'
    ).gt(latestVisibleOrders[0].updatedAt)
  }

  if (props.view === ActivityView.DerivativeTradeHistory) {
    const latestVisibleTrades = derivativeStore.subaccountTrades

    if (latestVisibleTrades.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestDerivativeTrade?.executedAt || '0'
    ).gt(latestVisibleTrades[0].executedAt)
  }

  if (props.view === ActivityView.SpotOrderHistory) {
    const latestVisibleOrders = spotStore.subaccountOrderHistory

    if (latestVisibleOrders.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestSpotOrderHistory?.updatedAt || '0'
    ).gt(latestVisibleOrders[0].updatedAt)
  }

  if (props.view === ActivityView.SpotTradeHistory) {
    const latestVisibleTrades = spotStore.subaccountTrades

    if (latestVisibleTrades.length === 0) {
      return
    }

    return new BigNumberInBase(
      activityStore.latestSpotTrade?.executedAt || '0'
    ).gt(latestVisibleTrades[0].executedAt)
  }
})

function handleClick() {
  emit('click')
}
</script>

<template>
  <BaseIcon
    v-if="showRefreshBtn && !status.isLoading()"
    name="exchange"
    class="text-gray-500 h-6 w-6 min-w-6 hover:text-blue-500"
    @click="handleClick"
  />
</template>
