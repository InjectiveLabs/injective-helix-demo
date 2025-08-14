<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { SpotMarketCyTags } from '@/types'
import type { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'

const breakpoints = useSharedBreakpoints()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    isAuthorized?: boolean
    order: DerivativeLimitOrder
  }>(),
  {}
)

const fourXl = breakpoints['4xl']

const status = reactive(new Status(StatusType.Idle))

function cancelOrder() {
  if (!props.isAuthorized) {
    return
  }

  status.setLoading()

  derivativeStore
    .cancelOrder(props.order)
    .then(() => {
      notificationStore.update({
        title: t('toast.trade.orderCancelled')
      })
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
      title: $t('trade.cancelOrder'),
      size: lg && !fourXl ? 'xs' : 'sm',
      dataCy: dataCyTag(SpotMarketCyTags.CancelOrderButton),
      tooltip: isAuthorized ? '' : $t('common.unauthorized')
    }"
    :class="fourXl ? 'min-w-16' : lg ? 'p-1 outline-none rounded-full' : 'py-2'"
    @click="cancelOrder"
  >
    <UIcon v-if="lg && !fourXl" :name="NuxtUiIcons.Trash" class="size-4" />
    <span v-else> {{ $t('trade.cancelOrder') }} </span>
  </AppButton>
</template>
