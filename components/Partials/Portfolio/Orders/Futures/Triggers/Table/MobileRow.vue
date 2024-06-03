<script setup lang="ts">
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'

import { Status, StatusType } from '@injectivelabs/utils'

const props = defineProps({
  trigger: {
    required: true,
    type: Object as PropType<DerivativeOrderHistory>
  }
})

const derivativeStore = useDerivativeStore()
const status = reactive(new Status(StatusType.Idle))
const { $onError } = useNuxtApp()
const { success, error } = useNotifications()
const { t } = useLang()

const {
  type,
  isBuy,
  total,
  price,
  market,
  quantity,
  leverage,
  isStopLoss,
  isReduceOnly,
  isCancelable,
  triggerPrice,
  isTakeProfit,
  isMarketOrder,
  priceDecimals,
  quantityDecimals
} = useTrigger(computed(() => props.trigger))

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

const { valueToString: triggerPriceToString } = useSharedBigNumberFormatter(
  triggerPrice,
  {
    decimalPlaces: quantityDecimals.value
  }
)

function cancelOrder() {
  if (!isCancelable.value) {
    return
  }

  status.setLoading()

  derivativeStore
    .cancelOrder(props.trigger)
    .catch((e) => {
      error({ title: t('common.error') })
      $onError(e)
    })
    .then(() => {
      success({ title: t('common.success') })
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div
      v-if="market"
      class="flex items-center space-x-2 px-2 pb-4 pt-2 font-sans"
    >
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.type') }}</p>
      <p>{{ type }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.side') }}</p>
      <div class="text-right">
        <p
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
        >
          {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
        </p>

        <p v-if="isReduceOnly" class="text-gray-500">
          {{ $t('trade.reduce_only') }}
        </p>
      </div>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>

      <p class="font-mono">
        <span v-if="isMarketOrder">{{ $t('trade.market') }}</span>
        <span v-else>{{ priceToString }}</span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p class="font-mono">{{ quantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.leverage') }}</p>
      <p>
        <span v-if="leverage.isNaN()" class="text-gray-400">
          {{ $t('trade.not_available_n_a') }}
        </span>
        <span v-else>{{ leverage.toFormat(2) }} &times;</span>
      </p>
    </div>

    <div v-if="market" class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>
      <p class="font-mono">
        {{ totalToString }} {{ market.quoteToken.symbol }}
      </p>
    </div>

    <div class="flex justify-between items-center px-2 py-4 space-x-2">
      <p>{{ $t('trade.triggerCondition') }}</p>

      <p>
        <span class="text-gray-500 text-xs font-sans">
          {{ $t('trade.mark_price') }}
        </span>

        <span
          v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)"
          class="text-white text-xs font-semibold"
        >
          &le;
        </span>
        <span v-else class="text-white text-xs font-semibold"> &ge;</span>

        <span>{{ triggerPriceToString }}</span>
      </p>
    </div>

    <div class="px-2 pt-2 flex items-center">
      <AppButton
        variant="danger-ghost"
        v-bind="{ status }"
        :disabled="!isCancelable"
        class="w-full"
        @click="cancelOrder"
      >
        {{ $t('trade.cancelTrigger') }}
      </AppButton>
    </div>
  </div>
</template>
