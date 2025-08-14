<script lang="ts" setup>
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import type { UiSpotMarket, UiDerivativeMarket } from '@/types'
import type {
  SpotLimitOrder,
  DerivativeLimitOrder
} from '@injectivelabs/sdk-ts'

const spotStore = useSpotStore()
const orderbookStore = useOrderbookStore()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    isBuy?: boolean
    isFutures?: boolean
    isDisabled?: boolean
    market: UiSpotMarket | UiDerivativeMarket
    order: SpotLimitOrder | DerivativeLimitOrder
  }>(),
  {}
)

const status = reactive(new Status(StatusType.Idle))

function chase() {
  const price = props.isBuy
    ? orderbookStore.buys[0]?.price
    : orderbookStore.sells[0]?.price

  if (!props.market || !price) {
    return
  }

  status.setLoading()

  if (props.isFutures) {
    derivativeStore
      .submitChase({
        market: props.market as UiDerivativeMarket,
        order: props.order as DerivativeLimitOrder,
        price: new BigNumberInBase(price)
      })
      .then(() => {
        notificationStore.update({ title: t('toast.trade.orderUpdated') })
      })
      .catch($onError)
      .finally(() => {
        status.setIdle()
      })
  } else {
    spotStore
      .submitChase({
        market: props.market as UiSpotMarket,
        order: props.order as SpotLimitOrder,
        price: new BigNumberInBase(price)
      })
      .then(() => {
        notificationStore.update({ title: t('toast.trade.orderUpdated') })
      })
      .catch($onError)
      .finally(() => {
        status.setIdle()
      })
  }
}
</script>

<template>
  <AppButton
    :class="[
      lg
        ? 'hover:underline p-1 text-green-500 font-semibold hover:bg-transparent disabled:text-coolGray-600 disabled:cursor-not-allowed flex items-center space-x-1'
        : 'py-2 leading-snug'
    ]"
    :disabled="isDisabled"
    :size="lg ? 'xs' : 'sm'"
    :is-loading="!lg && status.isLoading()"
    :variant="lg ? 'primary-cta' : 'primary'"
    @click="chase"
  >
    <span>{{ $t('trade.chase') }}</span>
    <AssetLogoSpinner v-if="lg && status.isLoading()" class="!w-4 !h-4" />
  </AppButton>
</template>
