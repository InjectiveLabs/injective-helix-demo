<script setup lang="ts">
import { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UiDerivativeMarket } from '@/types'

const authZStore = useAuthZStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const orderbookStore = useOrderbookStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const props = defineProps({
  order: {
    required: true,
    type: Object as PropType<DerivativeLimitOrder>
  }
})

const {
  isBuy,
  price,
  total,
  market,
  quantity,
  leverage,
  priceDecimals,
  // orderFillable,
  filledQuantity,
  quantityDecimals,
  unfilledQuantity
  // filledQuantityPercentageToFormat
} = useOrder(
  computed(() => props.order),
  computed(() => false)
)

const status = reactive(new Status(StatusType.Idle))
const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgCancelDerivativeOrder)
})

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: filledQuantityToString } = useSharedBigNumberFormatter(
  filledQuantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: unfilledQuantityToString } = useSharedBigNumberFormatter(
  unfilledQuantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: priceDecimals.value
})

function onCancelOrder() {
  status.setLoading()

  derivativeStore
    .cancelOrder(props.order as DerivativeLimitOrder)
    .then(() => {
      notificationStore.success({ title: t('trade.order_success_canceling') })
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function chase() {
  const price = isBuy.value
    ? orderbookStore.buys[0].price
    : orderbookStore.sells[0].price

  if (!market.value || !price) {
    return
  }

  derivativeStore
    .submitChase({
      market: market.value as UiDerivativeMarket,
      order: props.order,
      price: new BigNumberInBase(price)
    })
    .then(() => {
      notificationStore.success({ title: t('common.success') })
    })
    .catch($onError)
}
</script>

<template>
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.side') }}</p>

      <span
        :class="{
          'text-green-500': isBuy,
          'text-red-500': !isBuy
        }"
      >
        {{ $t(`trade.${order.orderSide}`) }}
      </span>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>
      <p class="font-mono">{{ priceToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p class="font-mono">{{ quantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.unfilled') }}</p>
      <p class="font-mono">{{ unfilledQuantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.filled') }}</p>
      <p class="font-mono">{{ filledQuantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.leverage') }}</p>
      <p class="font-mono">
        <span v-if="leverage.isNaN()" class="text-gray-400">
          {{ $t('trade.not_available_n_a') }}
        </span>
        <span v-else>{{ leverage.toFormat(2) }}&times;</span>
      </p>
    </div>

    <div class="flex justify-between items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>
      <p>
        {{ totalToString }}
        <span class="text-gray-500">{{ market?.quoteToken.symbol }}</span>
      </p>
    </div>

    <div class="pt-2 items-center">
      <AppButton variant="success-outline" class="w-full" @click="chase">
        <span>{{ $t('trade.chase') }}</span>
      </AppButton>
    </div>

    <div class="flex-1 pt-2">
      <AppButton
        :disabled="!isAuthorized"
        variant="danger-ghost"
        v-bind="{ status }"
        class="w-full"
        @click="onCancelOrder"
      >
        <span v-if="!isAuthorized">{{ $t('common.unauthorized') }}</span>
        <span v-else>{{ $t('trade.cancelOrder') }}</span>
      </AppButton>
    </div>
  </div>
</template>
