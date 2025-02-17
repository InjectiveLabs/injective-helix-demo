<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'

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
      notificationStore.success({
        title: t('common.success')
      })
    )
    .catch((e) => {
      $onError(e)
      notificationStore.error({ title: t('common.error') })
    })
    .finally(() => {
      status.setIdle()

      backupPromiseCall(async () => {
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
