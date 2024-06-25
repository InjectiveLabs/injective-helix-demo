<script setup lang="ts">
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { MsgType } from '@injectivelabs/ts-types'
import { backupPromiseCall } from '@/app/utils/async'

const props = defineProps({
  order: {
    type: Object as PropType<SpotLimitOrder>,
    required: true
  }
})

const authZStore = useAuthZStore()
const walletStore = useSharedWalletStore()
const spotStore = useSpotStore()
const notificationStore = useSharedNotificationStore()
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
  if (!walletStore.isAuthzWalletConnected) {
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
          class="font-sans"
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
        >
          {{ $t('trade.' + order.orderSide) }}
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
        <div class="text-right">
          <p>{{ filledQuantityToString }}</p>
          <p class="text-gray-500">{{ filledQuantityPercentageToFormat }}%</p>
        </div>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <div v-if="market" class="space-y-1">
          <p>
            {{ totalToString }}
            <span class="text-gray-500">{{ market.quoteToken.symbol }}</span>
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
          @click="cancelOrder"
        />
      </div>
    </div>
  </div>
</template>
