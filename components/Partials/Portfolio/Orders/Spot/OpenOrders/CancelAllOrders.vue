<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'
import { UiSpotMarket, spotMarketKey } from '@/types'

const props = defineProps({
  isTickerOnly: Boolean
})

const spotMarket = inject(spotMarketKey) as Ref<UiSpotMarket>

const spotStore = useSpotStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

const filteredOrders = computed(() =>
  props.isTickerOnly
    ? spotStore.subaccountOrders.filter(
        (order) => order.marketId === spotMarket.value.marketId
      )
    : spotStore.subaccountOrders
)

function cancelAllOrders() {
  status.setLoading()

  spotStore
    .batchCancelOrder(filteredOrders.value)
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
        await spotStore.fetchSubaccountOrders()
      })
    })
}
</script>

<template>
  <AppButton
    v-if="filteredOrders.length > 0"
    v-bind="{ status }"
    size="xs"
    variant="danger-ghost"
    @click="cancelAllOrders"
  >
    {{ $t('trade.cancelAllOrders') }}
  </AppButton>
</template>
