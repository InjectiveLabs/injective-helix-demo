<script setup lang="ts">
import { SpotOrderHistory } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'

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
  // isMarketOrder,
  quantityDecimals
} = useOrderHistory(
  computed(() => props.order),
  computed(() => true)
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
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})

const { valueToString: triggerPriceToString } = useSharedBigNumberFormatter(
  triggerPrice,
  {
    decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div class="flex p-2 text-xs font-mono">
    <div class="flex-1 flex items-center p-2 font-sans">{{ timestamp }}</div>
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.baseToken.symbol }}</p>
    </div>

    <div class="flex-1 flex items-center p-2 font-sans">{{ type }}</div>

    <div class="flex-1 flex items-center p-2">
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

    <div class="flex-1 flex items-center p-2">{{ priceToString }}</div>

    <div class="flex-1 flex items-center p-2">{{ quantityToString }}</div>

    <div class="flex-1 flex items-center p-2">
      <span>
        {{ totalToString }}
      </span>
      <span class="text-gray-500 ml-1">
        {{ market?.quoteToken.symbol }}
      </span>
    </div>

    <div class="flex-1 flex items-center p-2">
      <span v-if="triggerPrice.eq(0)"> - </span>
      <span v-else>{{ triggerPriceToString }}</span>
    </div>

    <div class="flex-1 flex items-center p-2 font-sans">
      {{ orderStatus }}
    </div>
  </div>
</template>
