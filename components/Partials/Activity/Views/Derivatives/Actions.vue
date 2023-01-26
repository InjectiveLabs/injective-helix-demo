<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityView } from '@/types'

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
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

const markets = computed(() => {
  return derivativeStore.markets
})

const market = computed(() => {
  return markets.value.find(
    (m) =>
      m.baseToken.denom === props.denom || m.quoteToken.denom === props.denom
  )
})

const orders = computed(() => {
  return props.view === ActivityView.DerivativeOrders
    ? derivativeStore.subaccountOrders
    : derivativeStore.subaccountConditionalOrders
})

const showCloseButton = computed(() => {
  if (orders.value.length === 0) {
    return false
  }
  const result =
    props.view === ActivityView.DerivativeOrders
      ? derivativeStore.subaccountOrders.filter((order) => {
          const sideMatch =
            props.side !== '' ? props.side === order.orderSide : true
          const marketMatch = market.value
            ? market.value.marketId === order.marketId
            : true

          return sideMatch && marketMatch
        })
      : derivativeStore.subaccountConditionalOrders.filter((order) => {
          const sideMatch =
            props.side !== '' ? props.side === order.direction : true
          const marketMatch = market.value
            ? market.value.marketId === order.marketId
            : true

          return sideMatch && marketMatch
        })

  return result.length > 0
})

function handleCancelOrders() {
  const action = orders.value.length === 1 ? cancelOrder : cancelAllOrder

  status.setLoading()

  action()
    .then(() => {
      success({
        title: t('trade.orders_cancelled')
      })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}

function cancelAllOrder() {
  return derivativeStore.batchCancelOrder(orders.value)
}

function cancelOrder() {
  const [order] = orders.value

  return derivativeStore.cancelOrder(order)
}
</script>

<template>
  <AppButton
    v-if="showCloseButton"
    class="text-red-500 bg-red-500 bg-opacity-10 font-semibold hover:text-white"
    data-cy="activity-cancel-all-button"
    :status="status"
    @click="handleCancelOrders"
  >
    <span class="whitespace-nowrap">
      {{ $t('trade.cancelAllOrders') }}
    </span>
  </AppButton>
</template>
