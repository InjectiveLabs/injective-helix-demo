<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarket, MarketKey } from '@/types'

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = withDefaults(
  defineProps<{
    isTickerOnly?: boolean
  }>(),
  {
    isTickerOnly: false
  }
)

const spotMarket = inject(MarketKey, undefined) as undefined | Ref<UiSpotMarket>

const status = reactive(new Status(StatusType.Idle))

const filteredOrders = computed(() =>
  props.isTickerOnly && spotMarket?.value
    ? spotStore.subaccountOrders.filter(
        (order) => order.marketId === spotMarket.value.marketId
      )
    : spotStore.subaccountOrders
)

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgBatchCancelSpotOrders)
})

function cancelAllOrders() {
  status.setLoading()

  spotStore
    .batchCancelOrder(filteredOrders.value)
    .then(() =>
      notificationStore.success({
        title: t('common.success')
      })
    )
    .catch($onError)
    .finally(() => status.setIdle())
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
