<script setup lang="ts">
import { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'

import { Status, StatusType } from '@injectivelabs/utils'

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

const authZStore = useAuthZStore()
const walletStore = useWalletStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { success } = useNotifications()
const { t } = useLang()

const status = reactive(new Status(StatusType.Idle))
const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const isAuthorized = computed(() => {
  if (!walletStore.isAuthzWalletConnected) {
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
    .then(() => success({ title: t('trade.order_success_canceling') }))
    .catch($onError)
    .finally(() => {
      status.setIdle()
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

      <div class="flex-1 flex items-center p-2">
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
          <p>{{ totalToString }} {{ market?.quoteToken.symbol }}</p>
        </div>
      </div>

      <div class="flex-1 p-2 flex justify-center">
        <PartialsCommonCancelButtonTooltip
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
