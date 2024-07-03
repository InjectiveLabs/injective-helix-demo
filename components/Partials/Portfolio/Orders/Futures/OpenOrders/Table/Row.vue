<script setup lang="ts">
import { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import { UiDerivativeMarket } from '@/types'

const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const derivativeStore = useDerivativeStore()
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
  filledQuantity,
  quantityDecimals,
  unfilledQuantity
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
  if (!isAuthorized.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .cancelOrder(props.order as DerivativeLimitOrder)
    .then(() =>
      notificationStore.success({ title: t('trade.order_success_canceling') })
    )
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
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </PartialsCommonMarketRedirection>

      <div class="flex-[0.5] flex items-center p-2">
        <span
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
        >
          {{ $t(`trade.${order.orderSide}`) }}
        </span>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ priceToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ quantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ unfilledQuantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ filledQuantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <span v-if="leverage.isNaN()" class="text-gray-400">
          {{ $t('trade.not_available_n_a') }}
        </span>
        <span v-else>{{ leverage.toFormat(2) }}&times;</span>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div class="space-y-1">
          <p>
            {{ totalToString }}
            <span class="text-gray-500">{{ market.quoteToken.symbol }}</span>
          </p>
        </div>
      </div>

      <div class="flex-1 p-2 flex justify-center">
        <button
          class="hover:underline text-green-500 font-semibold disabled:text-gray-600 disabled:cursor-not-allowed"
          :disabled="!sharedWalletStore.isAutoSignEnabled"
          @click="chase"
        >
          {{ $t('trade.chase') }}
        </button>
      </div>

      <div class="flex-1 p-2 flex justify-center">
        <PartialsCommonCancelButton
          v-bind="{
            status,
            isDisabled: !isAuthorized,
            tooltip: isAuthorized ? '' : $t('common.unauthorized')
          }"
          @click="onCancelOrder"
        />
      </div>
    </div>
  </div>
</template>
