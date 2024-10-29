<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { $onError } = useNuxtApp()
const { t } = useLang()

const props = withDefaults(
  defineProps<{
    order: SpotLimitOrder
  }>(),
  {}
)

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

const { valueToFixed: priceToFixed } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const { valueToFixed: quantityToFixed } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToFixed: totalToFixed } = useSharedBigNumberFormatter(total, {
  decimalPlaces: quantityDecimals.value
})

const { valueToFixed: filledQuantityToFixed } = useSharedBigNumberFormatter(
  filledQuantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToFixed: unfilledQuantityToFixed } = useSharedBigNumberFormatter(
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
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: priceToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: quantityToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.unfilled') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: unfilledQuantityToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.filled') }}</p>

      <div class="font-mono">
        <p>
          <AppAmount
            v-bind="{
              amount: filledQuantityToFixed
            }"
          />
        </p>
        <p class="text-coolGray-500">{{ filledQuantityPercentageToFormat }}%</p>
      </div>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>

      <div v-if="market" class="space-y-1 font-mono">
        <p>
          <span>$</span>
          <AppAmount
            v-bind="{
              amount: totalToFixed
            }"
          />
        </p>
      </div>
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
