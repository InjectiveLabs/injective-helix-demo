<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'
import { UiSpotMarket } from '@/types'

const props = defineProps({
  order: {
    type: Object as PropType<SpotLimitOrder>,
    required: true
  }
})

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const orderbookStore = useOrderbookStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const {
  isBuy,
  price,
  total,
  market,
  quantity,
  priceDecimals,
  orderFillable,
  filledQuantity,
  quantityDecimals,
  unfilledQuantity,
  filledQuantityPercentageToFormat
} = useOrder(
  computed(() => props.order),
  computed(() => true)
)

const status = reactive(new Status(StatusType.Idle))

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgCancelSpotOrder)
})

const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const { valueToString: quantityToString } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: totalToString } = useSharedBigNumberFormatter(total, {
  decimalPlaces: quantityDecimals.value
})

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

function cancelOrder() {
  status.setLoading()

  spotStore
    .cancelOrder(props.order as SpotLimitOrder)
    .then(() =>
      notificationStore.success({ title: t('trade.order_success_canceling') })
    )
    .catch($onError)
    .finally(() => {
      status.setIdle()

      backupPromiseCall(async () => {
        await spotStore.fetchSubaccountOrders()
      })
    })
}

function chase() {
  const price = isBuy.value
    ? orderbookStore.buys[0].price
    : orderbookStore.sells[0].price

  if (!market.value || !price) {
    return
  }

  spotStore
    .submitChase({
      market: market.value as UiSpotMarket,
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
  <div class="p-2 divide-y text-xs">
    <PartialsCommonMarketRedirection
      v-if="market"
      v-bind="{ market }"
      class="flex-1 flex items-center space-x-2 p-2 font-sans"
    >
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </PartialsCommonMarketRedirection>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.side') }}</p>
      <span
        class="font-sans"
        :class="{
          'text-green-500': isBuy,
          'text-red-500': !isBuy
        }"
      >
        {{ $t('trade.' + order.orderSide) }}
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
      <p class="font-mono">
        {{ unfilledQuantityToString }}
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.filled') }}</p>

      <div class="font-mono">
        <p>{{ filledQuantityToString }}</p>
        <p class="text-gray-500">{{ filledQuantityPercentageToFormat }}%</p>
      </div>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>

      <div v-if="market" class="space-y-1 font-mono">
        <p>${{ totalToString }}</p>
      </div>
    </div>

    <div class="px-2 pt-2 items-center">
      <AppButton
        variant="success-outline"
        class="w-full"
        :disabled="!sharedWalletStore.isAutoSignEnabled"
        @click="chase"
      >
        <span>{{ $t('trade.chase') }}</span>
      </AppButton>
    </div>

    <div class="px-2 pt-2 items-center">
      <AppButton
        v-if="orderFillable"
        :disabled="!isAuthorized"
        variant="danger-ghost"
        v-bind="{ status }"
        class="w-full"
        @click="cancelOrder"
      >
        <span v-if="!isAuthorized">{{ $t('common.unauthorized') }}</span>
        <span v-else>{{ $t('trade.cancelOrder') }}</span>
      </AppButton>
    </div>
  </div>
</template>
