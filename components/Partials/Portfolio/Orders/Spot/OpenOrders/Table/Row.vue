<script setup lang="ts">
import { UiSpotLimitOrder } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  order: {
    type: Object as PropType<UiSpotLimitOrder>,
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
  filledQuantity,
  quantityDecimals,
  unfilledQuantity,
  filledQuantityPercentageToFormat
} = useOrder(
  computed(() => props.order),
  computed(() => true)
)

const { valueToString: priceToString } = useBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value
})

const { valueToString: quantityToString } = useBigNumberFormatter(quantity, {
  decimalPlaces: quantityDecimals.value
})

const { valueToString: totalToString } = useBigNumberFormatter(total, {
  decimalPlaces: quantityDecimals.value
})

const { valueToString: filledQuantityToString } = useBigNumberFormatter(
  filledQuantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToString: unfilledQuantityToString } = useBigNumberFormatter(
  unfilledQuantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)
</script>

<template>
  <div class="flex p-2 text-xs font-mono">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.baseToken.symbol }}</p>
    </div>

    <div class="flex-1 flex items-center p-2">
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

    <div class="flex-1 flex items-center p-2">{{ priceToString }}</div>

    <div class="flex-1 flex items-center p-2">{{ quantityToString }}</div>

    <div class="flex-1 flex items-center p-2">
      {{ unfilledQuantityToString }}
    </div>

    <div class="flex-1 flex items-center p-2">
      <div>
        <p>{{ filledQuantityToString }}</p>
        <p class="text-gray-500">{{ filledQuantityPercentageToFormat }}%</p>
      </div>
    </div>

    <div class="flex-1 flex items-center p-2">
      <div v-if="market" class="space-y-1">
        <p>$ {{ totalToString }}</p>
      </div>
    </div>
  </div>
</template>
