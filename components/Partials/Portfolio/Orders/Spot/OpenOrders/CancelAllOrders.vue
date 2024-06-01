<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { MsgType } from '@injectivelabs/ts-types'
import { backupPromiseCall } from '@/app/utils/async'
import { UiSpotMarket, spotMarketKey } from '@/types'

const props = defineProps({
  isTickerOnly: Boolean
})

const spotMarket = inject(spotMarketKey) as Ref<UiSpotMarket>

const walletStore = useWalletStore()
const authZStore = useAuthZStore()
const spotStore = useSpotStore()
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
  <AppButtonTooltip
    v-if="filteredOrders.length > 0"
    v-bind="{ status, tooltip: isAuthorized ? '' : $t('common.unauthorized') }"
    size="xs"
    variant="danger-ghost"
    :disabled="!isAuthorized"
    @click="cancelAllOrders"
  >
    {{ $t('trade.cancelAllOrders') }}
  </AppButtonTooltip>
</template>
