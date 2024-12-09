<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'

const authZStore = useAuthZStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const status = reactive(new Status(StatusType.Idle))

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
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
    })
}
</script>

<template>
  <AppButton
    v-if="derivativeStore.subaccountOrders.length > 0"
    v-bind="{ status, tooltip: isAuthorized ? '' : $t('common.unauthorized') }"
    :disabled="!isAuthorized"
    variant="danger-shade"
    size="xs"
    @click="cancelAllOrders"
  >
    <span class="hidden 3xl:block 4xl:hidden">
      {{ $t('trade.cancelAll') }}
    </span>
    <span class="3xl:hidden 4xl:block">
      {{ $t('trade.cancelAllOrders') }}
    </span>
  </AppButton>
</template>
