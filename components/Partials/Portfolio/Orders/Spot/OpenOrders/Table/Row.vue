<script setup lang="ts">
import { MsgType } from '@injectivelabs/ts-types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '@/app/utils/async'
import { SpotMarketCyTags } from '@/types'

const authZStore = useAuthZStore()
const spotStore = useSpotStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()

const props = defineProps({
  order: {
    type: Object as PropType<SpotLimitOrder>,
    required: true
  }
})

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
  decimalPlaces: priceDecimals.value
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
        {{ priceToString }}
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderQty)"
      >
        {{ quantityToString }}
      </div>

      <div
        class="flex-1 flex items-center p-2 justify-end"
        :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderUnfilledQty)"
      >
        {{ unfilledQuantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div class="text-right">
          <p :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderFilledQty)">
            {{ filledQuantityToString }}
          </p>
          <p class="text-gray-500">{{ filledQuantityPercentageToFormat }}%</p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div v-if="market" class="space-y-1">
          <p :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderTotalAmt)">
            {{ totalToString }}
            <span
              class="text-gray-500"
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
