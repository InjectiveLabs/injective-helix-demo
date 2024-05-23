<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'

const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()
const { t } = useLang()

function cancelAllTriggers() {
  status.setLoading()

  derivativeStore
    .batchCancelOrder(derivativeStore.subaccountConditionalOrders)
    .then(() =>
      success({
        title: t('common.success')
      })
    )
    .catch((e) => {
      $onError(e)
      error({ title: t('common.error') })
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
    variant="danger-ghost"
    @click="cancelAllTriggers"
  >
    {{ $t('trade.cancelAllTriggers') }}
  </AppButton>
</template>
