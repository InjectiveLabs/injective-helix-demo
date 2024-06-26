<script setup lang="ts">
import { SpotOrderHistory } from '@injectivelabs/sdk-ts'

const props = defineProps({
  order: {
    type: Object as PropType<SpotOrderHistory>,
    required: true
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
  orderStatus,
  triggerPrice,
  priceDecimals,
  quantityDecimals
} = useOrderHistory(
  computed(() => props.order),
  computed(() => true)
)

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

const { valueToString: triggerPriceToString } = useSharedBigNumberFormatter(
  triggerPrice,
  {
    decimalPlaces: priceDecimals.value
  }
)
</script>

<template>
  <div v-if="market">
    <div class="flex p-2 text-xs font-mono">
      <div class="flex-1 flex items-center p-2 font-sans">{{ timestamp }}</div>
      <PartialsCommonMarketRedirection
        v-bind="{ market }"
        class="flex-1 flex items-center space-x-2 p-2 font-sans"
      >
        <CommonTokenIcon v-bind="{ token: market.baseToken }" />
        <p>{{ market.ticker }}</p>
      </PartialsCommonMarketRedirection>

      <div class="flex-[0.5] flex items-center p-2 font-sans">{{ type }}</div>

      <div class="flex-[0.5] flex items-center p-2">
        <span
          :class="{
            'text-green-500': isBuy,
            'text-red-500': !isBuy
          }"
          class="font-sans"
        >
          {{ $t(`trade.${order.direction}`) }}
        </span>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ priceToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ quantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        <span>
          {{ totalToString }}
        </span>
        <span class="text-gray-500 ml-1">
          {{ market?.quoteToken.symbol }}
        </span>
      </div>

      <div class="flex-1 flex justify-center items-center p-2">
        <span v-if="triggerPrice.eq(0)"> - </span>
        <span v-else>{{ triggerPriceToString }}</span>
      </div>

      <div class="flex-1 flex items-center p-2 font-sans">
        {{ orderStatus }}
      </div>
    </div>
  </div>
</template>
