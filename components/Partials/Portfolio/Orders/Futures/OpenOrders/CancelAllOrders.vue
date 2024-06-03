<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'

const authZStore = useAuthZStore()
const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()
const { t } = useLang()

const isAuthorized = computed(() => {
  if (!walletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgBatchCancelDerivativeOrders)
})

function cancelAllOrders() {
  if (!isAuthorized.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .batchCancelOrder(derivativeStore.subaccountOrders)
    .then(() =>
      success({
        title: t('common.success')
      })
    )
    .catch((e) => {
      error({ title: t('common.error') })
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
  <AppButtonTooltip
    v-if="derivativeStore.subaccountOrders.length > 0"
    v-bind="{ status, tooltip: isAuthorized ? '' : $t('common.unauthorized') }"
    :disabled="!isAuthorized"
    variant="danger-ghost"
    size="xs"
    @click="cancelAllOrders"
  >
    {{ $t('trade.cancelAllOrders') }}
  </AppButtonTooltip>
</template>
