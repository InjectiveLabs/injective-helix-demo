<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'

const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()
const { t } = useLang()

function cancelAllOrders() {
  status.setLoading()

  derivativeStore
    .batchCancelOrder(derivativeStore.subaccountOrders)
    .then(() => {
      success({
        title: t('common.success')
      })
    })
    .catch((e) => {
      error({ title: t('common.error') })
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="divide-y">
    <Teleport to="#cancel-teleport">
      <AppButton
        v-if="derivativeStore.subaccountOrders.length > 0"
        v-bind="{ status }"
        variant="danger-ghost"
        size="xs"
        @click="cancelAllOrders"
      >
        {{ $t('trade.cancelAllOrders') }}
      </AppButton>
    </Teleport>

    <PartialsPortfolioOrdersFuturesOpenOrdersTableHeader />

    <PartialsPortfolioOrdersFuturesOpenOrdersTableRow
      v-for="order in derivativeStore.subaccountOrders"
      :key="`${order.orderHash}-${order.cid}`"
      v-bind="{ order }"
    />

    <CommonEmptyList
      v-if="derivativeStore.subaccountOrders.length === 0"
      :message="'No Open Orders'"
    />
  </div>
</template>
