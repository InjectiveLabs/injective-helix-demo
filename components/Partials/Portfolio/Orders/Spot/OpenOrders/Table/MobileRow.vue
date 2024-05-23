<script setup lang="ts">
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { backupPromiseCall } from '~/app/utils/async'

const props = defineProps({
  order: {
    type: Object as PropType<SpotLimitOrder>,
    required: true
  }
})

const spotStore = useSpotStore()
const { success } = useNotifications()
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

const { valueToString: priceToString } = useBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value
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
    .then(() => {
      success({ title: t('trade.order_success_canceling') })
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
  <div class="p-2 divide-y text-xs">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

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

    <div class="flex-1 flex items-center p-2">
      <p>{{ $t('trade.total') }}</p>
      <div v-if="market" class="space-y-1">
        <p>${{ totalToString }}</p>
      </div>
    </div>

    <div class="flex-1 p-2 items-center">
      <PartialsCommonCancelButton
        v-if="orderFillable"
        v-bind="{ status }"
        @click="cancelOrder"
      />
    </div>
  </div>
</template>
