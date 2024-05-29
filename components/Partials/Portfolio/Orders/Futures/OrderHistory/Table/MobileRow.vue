<script setup lang="ts">
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'

const props = defineProps({
  order: {
    required: true,
    type: Object as PropType<DerivativeOrderHistory>
  }
})

const {
  type,
  isBuy,
  total,
  price,
  market,
  quantity,
  timestamp,
  isStopLoss,
  orderStatus,
  isTakeProfit,
  triggerPrice,
  isReduceOnly,
  priceDecimals,
  isMarketOrder,
  quantityDecimals
} = useOrderHistory(
  computed(() => props.order),
  computed(() => false)
)

const { valueToString: priceToString } = useSharedBigNumberFormatter(price, {
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

const { valueToString: triggerPriceToString } = useSharedBigNumberFormatter(
  triggerPrice,
  {
    decimalPlaces: quantityDecimals.value
  }
)
</script>

<template>
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.lastUpdated') }}</p>
      <p>{{ timestamp }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.type') }}</p>
      <span class="font-sans">
        {{ type }}
      </span>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.side') }}</p>
      <div>
        <p
          class="font-sans"
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
        >
          {{ $t(`trade.${isBuy ? 'buy' : 'sell'}`) }}
        </p>

        <p v-if="isReduceOnly" class="text-gray-400">
          {{ $t('trade.reduce_only') }}
        </p>
      </div>
    </div>

    <div class="flex justify-between items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>

      <p>
        <span v-if="isMarketOrder" class="font-sans">
          {{ $t('trade.market') }}
        </span>

        <span v-else>
          {{ priceToString }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p>{{ quantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 space-x-1">
      <p>{{ $t('trade.total') }}</p>

      <p>
        <span>
          {{ totalToString }}
        </span>

        <span v-if="market" class="text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.triggerCondition') }}</p>
      <p>
        <template v-if="order.isConditional">
          <span class="text-gray-500 text-xs font-semibold">
            {{ $t('trade.mark_price') }}
          </span>

          <span
            v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)"
            class="text-white text-xs font-semibold"
          >
            &le;
          </span>
          <span v-else class="text-white text-xs font-semibold"> &ge; </span>

          {{ triggerPriceToString }}
        </template>

        <template v-else>
          <span>&mdash;</span>
        </template>
      </p>
    </div>

    <div class="justify-between flex font-sans items-center px-2 py-4">
      <p>{{ $t('trade.orderStatus') }}</p>
      <span>{{ orderStatus }}</span>
    </div>
  </div>
</template>
