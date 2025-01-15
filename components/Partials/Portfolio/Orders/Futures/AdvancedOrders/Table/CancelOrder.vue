<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { SpotMarketCyTags } from '@/types'

const breakpoints = useSharedBreakpoints()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    isAuthorized?: boolean
    isCancelable?: boolean
    trigger: DerivativeOrderHistory
  }>(),
  {}
)

const xxl = breakpoints['2xl']

const status = reactive(new Status(StatusType.Idle))

function cancelOrder() {
  if (!props.isCancelable) {
    return
  }

  status.setLoading()

  derivativeStore
    .cancelOrder(props.trigger)
    .then(() => {
      notificationStore.success({ title: t('common.success') })
    })
    .catch((e) => {
      notificationStore.error({ title: t('common.error') })
      $onError(e)
    })
    .finally(() => status.setIdle())
}
</script>

<template>
  <AppButton
    v-bind="{
      status,
      disabled: !isAuthorized,
      variant: 'danger-shade',
      size: lg && !xxl ? 'xs' : 'sm',
      title: $t('trade.cancelOrder'),
      dataCy: dataCyTag(SpotMarketCyTags.CancelOrderButton),
      tooltip: isAuthorized ? '' : $t('common.unauthorized')
    }"
    :class="xxl ? 'min-w-16' : lg ? 'p-1 outline-none rounded-full' : 'py-2'"
    @click="cancelOrder"
  >
    <UIcon v-if="lg && !xxl" :name="NuxtUiIcons.Trash" class="size-4" />
    <span v-else> {{ $t('trade.cancelOrder') }} </span>
  </AppButton>
</template>
