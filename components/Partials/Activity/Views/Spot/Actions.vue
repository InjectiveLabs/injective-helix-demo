<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const spotStore = useSpotStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const props = defineProps({
  denom: {
    type: String,
    default: ''
  },

  side: {
    type: String,
    default: ''
  },

  view: {
    type: String,
    required: true
  }
})

const status = reactive(new Status(StatusType.Idle))

const market = computed(() => {
  return spotStore.markets.find(
    (m) =>
      m.baseToken.denom === props.denom || m.quoteToken.denom === props.denom
  )
})

const orders = computed(() => {
  return spotStore.subaccountOrders
})

const showCloseButton = computed(() => {
  if (orders.value.length === 0) {
    return false
  }

  const result = orders.value.filter((order) => {
    const sideMatch = props.side !== '' ? props.side === order.orderSide : true
    const marketMatch = market.value
      ? market.value.marketId === order.marketId
      : true

    return sideMatch && marketMatch
  })

  return result.length > 0
})

function handleCancelOrders() {
  status.setLoading()

  const action = orders.value.length === 1 ? cancelOrder : cancelAllOrders

  action()
    .then(() => {
      success({
        title: t('trade.orders_cancelled')
      })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function cancelOrder() {
  const [order] = orders.value

  return spotStore.cancelOrder(order)
}

function cancelAllOrders() {
  return spotStore.batchCancelOrder(orders.value)
}
</script>

<template>
  <AppButton
    v-if="showCloseButton"
    class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
    :status="status"
    data-cy="activity-cancel-all-button"
    @click="handleCancelOrders"
  >
    <span class="whitespace-nowrap">
      {{ $t('trade.cancelAllOrders') }}
    </span>
  </AppButton>
</template>
