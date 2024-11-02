<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { MsgType } from '@injectivelabs/ts-types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import { SpotMarketCyTags, UiSpotMarket } from '@/types'
import { backupPromiseCall } from '@/app/utils/async'
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

const orderTotalQuote = computed(() => price.value.times(quantity.value))

const chaseTotalQuote = computed(() => highestBid.value.times(quantity.value))

const chaseBalanceNeeded = computed(() =>
  chaseTotalQuote.value.minus(orderTotalQuote.value)
)

const insufficientBalance = computed(() =>
  chaseBalanceNeeded.value.gt(accountQuoteBalance.value)
)

function cancelOrder() {
  if (!isAuthorized.value) {
    return
  }

  status.setLoading()

  spotStore
    .cancelOrder(props.order as SpotLimitOrder)
    .then(() => {
      notificationStore.success({ title: t('trade.order_success_canceling') })
    })
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
  <div v-if="market">
    <div
      class="flex p-2 text-xs font-mono"
      :data-cy="dataCyTag(SpotMarketCyTags.OpenOrdersRow)"
    >
      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p
          :data-cy="`${dataCyTag(SpotMarketCyTags.OpenOrderMarketTicker)}-${
            market.ticker
          }`"
        >
          {{ market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>

      <div class="flex-[0.5] flex items-center p-2">
        <span
          class="font-sans"
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
          :data-cy="`${dataCyTag(SpotMarketCyTags.OpenOrderSide)}-${
            order.orderSide
          }`"
        >
          {{ $t('trade.' + order.orderSide) }}
        </span>
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderPrice)"
      >
        <AppAmount
          v-bind="{
            amount: price.toFixed(),
            decimalPlaces: priceDecimals
          }"
        />
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderQty)"
      >
        <AppAmount
          v-bind="{
            amount: quantity.toFixed(),
            decimalPlaces: quantityDecimals
          }"
        />
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderUnfilledQty)"
      >
        <AppAmount
          v-bind="{
            decimalPlaces: quantityDecimals,
            amount: unfilledQuantity.toFixed()
          }"
        />
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div class="text-right">
          <p
            :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderFilledQty)"
            class="flex gap-1"
          >
            <AppAmount
              v-bind="{
                decimalPlaces: quantityDecimals,
                amount: filledQuantity.toFixed()
              }"
            />
          </p>
          <p class="text-coolGray-500">
            {{ filledQuantityPercentageToFormat }}%
          </p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div v-if="market" class="space-y-1">
          <p :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderTotalAmt)">
            <AppAmount
              v-bind="{
                amount: total.toFixed(),
                decimalPlaces: priceDecimals
              }"
            />
            <span
              class="text-coolGray-500 ml-1"
              :data-cy="
                dataCyTag(SpotMarketCyTags.OpenOrderTotalAmtTokenSymbol)
              "
            >
              {{ market.quoteToken.symbol }}
            </span>
          </p>
        </div>
      </div>

      <div class="flex-1 p-2 flex items-center justify-center">
        <button
          class="hover:underline text-green-500 font-semibold disabled:text-gray-600 disabled:cursor-not-allowed flex items-center space-x-1"
          :disabled="
            !sharedWalletStore.isAutoSignEnabled || insufficientBalance
          "
          @click="chase"
        >
          <span>{{ $t('trade.chase') }}</span>
          <AssetLogoSpinner v-if="chaseStatus.isLoading()" class="!w-4 !h-4" />
        </button>
      </div>

      <div class="flex-1 p-2 flex items-center justify-center">
        <PartialsCommonCancelButton
          v-if="orderFillable"
          v-bind="{
            status,
            isDisabled: !isAuthorized,
            tooltip: isAuthorized ? '' : $t('common.unauthorized')
          }"
          :data-cy="dataCyTag(SpotMarketCyTags.CancelOrderButton)"
          @click="cancelOrder"
        />
      </div>
    </div>
  </div>
</template>
