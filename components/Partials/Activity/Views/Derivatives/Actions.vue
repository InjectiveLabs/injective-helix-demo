<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { ActivityView } from '@/types'

const props = defineProps({
  view: {
    type: String,
    required: true
  }
})

const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const orders = computed(() => {
  return props.view === ActivityView.DerivativeOrders
    ? derivativeStore.subaccountOrders
    : derivativeStore.subaccountConditionalOrders
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
    v-if="orders.length > 0"
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
