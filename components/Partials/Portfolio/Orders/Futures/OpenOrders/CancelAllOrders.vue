<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '~/app/utils/async'

const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

function cancelAllOrders() {
  status.setLoading()

  derivativeStore
    .batchCancelOrder(derivativeStore.subaccountOrders)
    .then(() =>
      notificationStore.success({
        title: t('common.success')
      })
    )
    .catch((e) => {
      notificationStore.error({ title: t('common.error') })
      $onError(e)
    })
    .finally(() => {
      status.setIdle()

      backupPromiseCall(async () => {
        await derivativeStore.fetchSubaccountOrders()
      })
    })
}
</script>

<template>
  <AppButton
    v-if="derivativeStore.subaccountOrders.length > 0"
    v-bind="{ status }"
    variant="danger-ghost"
    size="xs"
    @click="cancelAllOrders"
  >
    {{ $t('trade.cancelAllOrders') }}
  </AppButton>
</template>
