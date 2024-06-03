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
    .then(() => success({ title: t('common.success') }))
    .catch((e) => {
      error({ title: t('common.error') })
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}
</script>

<template>
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <PartialsCommonMarketRedirection
        v-if="market"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
        v-bind="{ market }"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </PartialsCommonMarketRedirection>

      <div class="flex-1 flex items-center p-2 font-sans">{{ type }}</div>

      <div class="flex-1 flex items-center p-2 font-sans">
        <div>
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

      <div class="flex-1 flex items-center p-2 justify-end">
        <span v-if="isMarketOrder">{{ $t('trade.market') }}</span>
        <span v-else>{{ priceToString }}</span>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ quantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <span v-if="leverage.isNaN()" class="text-gray-400">
          {{ $t('trade.not_available_n_a') }}
        </span>
        <span v-else>{{ leverage.toFormat(2) }} &times;</span>
      </div>

      <div v-if="market" class="flex-1 flex items-center p-2 justify-end">
        {{ totalToString }} {{ market.quoteToken.symbol }}
      </div>

      <div class="flex-[2] flex items-center p-2 space-x-2 justify-end">
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
      </div>

      <div class="p-2 flex items-center flex-1 justify-center">
        <PartialsCommonCancelButton
          v-bind="{ status }"
          :is-disabled="!isCancelable"
          @click="cancelOrder"
        />
      </div>
    </div>
  </div>
</template>
