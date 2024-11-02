<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'
import { UiSpotMarket } from '@/types'
import { toBalanceInToken } from '@/app/utils/formatters'

const props = withDefaults(
  defineProps<{
    order: SpotLimitOrder
  }>(),
  {}
)

const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const orderbookStore = useOrderbookStore()
const { userBalancesWithToken } = useBalance()
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
const chaseStatus = reactive(new Status(StatusType.Idle))

const isAuthorized = computed(() => {
  if (!sharedWalletStore.isAuthzWalletConnected) {
    return true
  }

  return authZStore.hasAuthZPermission(MsgType.MsgCancelSpotOrder)
})

const accountQuoteBalance = computed(() => {
  if (!market.value) {
    return new BigNumberInBase(0)
  }

  const balance = userBalancesWithToken.value.find(
    (balance) => balance.denom === market.value?.quoteDenom
  )

  return toBalanceInToken({
    value: balance?.availableMargin || 0,
    decimalPlaces: market.value.quoteToken.decimals
  })
})

const highestBid = computed(
  () => new BigNumberInBase(orderbookStore.buys[0]?.price)
)

const orderTotalQuote = computed(() =>
  new BigNumberInBase(price.value).times(quantity.value)
)

const chaseTotalQuote = computed(() => highestBid.value.times(quantity.value))

const chaseBalanceNeeded = computed(() =>
  chaseTotalQuote.value.minus(orderTotalQuote.value)
)

const insufficientBalance = computed(() =>
  chaseBalanceNeeded.value.gt(accountQuoteBalance.value)
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

  chaseStatus.setLoading()

  spotStore
    .submitChase({
      market: market.value as UiSpotMarket,
      order: props.order,
      price: new BigNumberInBase(price)
    })
    .then(() => {
      notificationStore.success({ title: t('trade.orderUpdated') })
    })
    .catch($onError)
    .finally(() => {
      chaseStatus.setIdle()
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
            amount: price.toFixed(),
            decimalPlaces: priceDecimals
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: quantity.toFixed(),
            decimalPlaces: quantityDecimals
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.unfilled') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            decimalPlaces: quantityDecimals,
            amount: unfilledQuantity.toFixed()
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
              decimalPlaces: quantityDecimals,
              amount: filledQuantity.toFixed()
            }"
          />
        </p>
        <p class="text-coolGray-500">{{ filledQuantityPercentageToFormat }}%</p>
      </div>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>

      <div v-if="market" class="space-y-1 font-mono">
        <p class="flex gap-1">
          <AppAmount
            v-bind="{
              amount: total.toFixed(),
              decimalPlaces: priceDecimals
            }"
          />
          <span class="text-coolGray-500 ml-1">
            {{ market.quoteToken.symbol }}
          </span>
        </p>
      </div>
    </div>

    <div class="px-2 pt-2 items-center">
      <AppButton
        variant="success-outline"
        class="w-full"
        v-bind="{ status: chaseStatus }"
        :disabled="!sharedWalletStore.isAutoSignEnabled || insufficientBalance"
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
