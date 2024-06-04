<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MsgType } from '@injectivelabs/ts-types'
import { backupPromiseCall } from '@/app/utils/async'
import { UiSpotMarket, SpotMarketKey } from '@/types'

const props = defineProps({
  isTickerOnly: Boolean
})

const spotMarket = inject(SpotMarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const walletStore = useWalletStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()
const { t } = useLang()

const filteredOrders = computed(() =>
  props.isTickerOnly
    ? spotStore.subaccountOrders.filter(
        (order) => order.marketId === spotMarket.value.marketId
      )
    : spotStore.subaccountOrders
)

const isAuthorized = computed(() => {
  if (!walletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgBatchCancelSpotOrders)
})

function cancelAllOrders() {
  status.setLoading()

  spotStore
    .batchCancelOrder(filteredOrders.value)
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
    v-if="filteredOrders.length > 0"
    v-bind="{ status, tooltip: isAuthorized ? '' : $t('common.unauthorized') }"
    size="xs"
    variant="danger-ghost"
    :disabled="!isAuthorized"
    @click="cancelAllOrders"
  >
    {{ $t('trade.cancelAllOrders') }}
  </AppButton>
</template>
