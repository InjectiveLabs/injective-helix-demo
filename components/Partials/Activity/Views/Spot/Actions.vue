<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'

const spotStore = useSpotStore()
const { success } = useNotifications()
const { $onError } = useNuxtApp()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))

const orders = computed(() => {
  return spotStore.subaccountOrders
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
    v-if="orders.length > 0"
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
