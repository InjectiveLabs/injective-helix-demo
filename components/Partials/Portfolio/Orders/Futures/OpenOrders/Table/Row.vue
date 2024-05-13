<script setup lang="ts">
import { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'

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
  // orderFillable,
  filledQuantity,
  quantityDecimals,
  unfilledQuantity
  // filledQuantityPercentageToFormat
} = useOrder(
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
</script>

<template>
  <div class="flex p-2 text-xs font-mono">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.baseToken.symbol }}</p>
    </div>

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

    <div class="flex-1 flex items-center p-2">{{ priceToString }}</div>

    <div class="flex-1 flex items-center p-2">{{ quantityToString }}</div>

    <div class="flex-1 flex items-center p-2">
      {{ unfilledQuantityToString }}
    </div>

    <div class="flex-1 flex items-center p-2">{{ filledQuantityToString }}</div>

    <div class="flex-1 flex items-center p-2">
      {{ leverage.toFormat(2) }}&times;
    </div>

    <div class="flex-1 flex items-center p-2">
      <div class="space-y-1">
        <p>{{ totalToString }} {{ market?.quoteToken.symbol }}</p>
      </div>
    </div>
  </div>
</template>
