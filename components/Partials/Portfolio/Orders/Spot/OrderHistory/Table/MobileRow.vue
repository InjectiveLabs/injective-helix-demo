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
  <div class="p-2 text-xs divide-y border-b border-brand-700">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

    <div class="flex items-center px-2 py-4 justify-between font-sans">
      <p>{{ $t('trade.time') }}</p>
      <p>{{ timestamp }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.type') }}</p>
      <p>{{ type }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.side') }}</p>
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

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.price') }}</p>
      <p class="font-mono">{{ priceToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p class="font-mono">{{ quantityToString }}</p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>
      <p class="font-mono">
        <span>
          {{ totalToString }}
        </span>
        <span class="text-gray-500 ml-1">
          {{ market?.quoteToken.symbol }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.triggerCondition') }}</p>
      <p>
        <span v-if="triggerPrice.eq(0)"> &mdash; </span>
        <span v-else class="font-mono">{{ triggerPriceToString }}</span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.orderStatus') }}</p>
      <p>{{ orderStatus }}</p>
    </div>
  </div>
</template>
