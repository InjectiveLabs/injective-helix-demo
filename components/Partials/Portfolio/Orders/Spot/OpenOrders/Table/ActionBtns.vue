<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotMarketCyTags } from '@/types'

const { t } = useLang()
const spotStore = useSpotStore()
const { $onError } = useNuxtApp()
const notificationStore = useSharedNotificationStore()

const props = withDefaults(
  defineProps<{
    order: SpotLimitOrder
    isAuthorized?: boolean
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Idle))

function cancelOrder() {
  status.setLoading()

  spotStore
    .cancelOrder(props.order)
    .then(() => {
      notificationStore.success({ title: t('trade.order_success_canceling') })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <AppButton
    v-bind="{
      status,
      disabled: !isAuthorized,
      tooltip: isAuthorized ? '' : $t('common.unauthorized')
    }"
    size="sm"
    variant="danger-shade"
    class="min-w-16"
    :data-cy="dataCyTag(SpotMarketCyTags.CancelOrderButton)"
    @click="cancelOrder"
  >
    {{ $t('trade.cancelOrder') }}
  </AppButton>
</template>
