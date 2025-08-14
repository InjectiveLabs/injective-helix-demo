<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { sharedBackupPromiseCall } from '@shared/utils/async'

const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

function cancelAllAdvancedOrders() {
  status.setLoading()

  derivativeStore
    .batchCancelOrder(derivativeStore.subaccountConditionalOrders)
    .then(() =>
      notificationStore.update({
        title: t('toast.trade.allAdvancedOrdersCancelled')
      })
    )
    .catch((e) => {
      $onError(e)
      notificationStore.error({ title: t('toast.error') })
    })
    .finally(() => {
      status.setIdle()

      sharedBackupPromiseCall(async () => {
        await derivativeStore.fetchSubaccountConditionalOrders()
      })
    })
}
</script>

<template>
  <AppButton
    v-if="derivativeStore.subaccountConditionalOrders.length > 0"
    v-bind="{ status }"
    size="xs"
    variant="danger-shade"
    @click="cancelAllAdvancedOrders"
  >
    <span>
      {{ $t('trade.cancelAll') }}
    </span>
  </AppButton>
</template>
