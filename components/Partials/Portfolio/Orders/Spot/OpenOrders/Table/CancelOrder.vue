<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotMarketCyTags } from '@/types'

const spotStore = useSpotStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg, xl } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    order: SpotLimitOrder
    isAuthorized?: boolean
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Idle))

function cancelOrder() {
  if (!props.isAuthorized) {
    return
  }

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
      variant: 'danger-shade',
      size: lg && !xl ? 'xs' : 'sm',
      title: $t('trade.cancelOrder'),
      dataCy: dataCyTag(SpotMarketCyTags.CancelOrderButton),
      tooltip: isAuthorized ? '' : $t('common.unauthorized')
    }"
    :class="xl ? 'min-w-16' : lg ? 'p-1 outline-none rounded-full' : 'py-2'"
    @click="cancelOrder"
  >
    <UIcon v-if="lg && !xl" :name="NuxtUiIcons.Trash" class="size-4" />
    <span v-else> {{ $t('trade.cancelOrder') }} </span>
  </AppButton>
</template>
