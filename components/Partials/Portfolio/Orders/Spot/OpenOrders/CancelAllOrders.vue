<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'

const spotStore = useSpotStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()
const { t } = useLang()

function cancelAllOrders() {
  status.setLoading()

  spotStore
    .batchCancelOrder(spotStore.subaccountOrders)
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
        await spotStore.fetchSubaccountOrders()
      })
    })
}
</script>

<template>
  <AppButton
    v-if="spotStore.subaccountOrders.length > 0"
    v-bind="{ status }"
    size="xs"
    variant="danger-ghost"
    @click="cancelAllOrders"
  >
    {{ $t('trade.cancelAllOrders') }}
  </AppButton>
</template>
