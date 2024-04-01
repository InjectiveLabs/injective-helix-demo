<script setup lang="ts">
import { UiDerivativeOrderHistory } from '@injectivelabs/sdk-ui-ts'

const props = defineProps({
  trigger: {
    required: true,
    type: Object as PropType<UiDerivativeOrderHistory>
  }
})

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
  // isCancelable,
  triggerPrice,
  isTakeProfit,
  isMarketOrder,
  priceDecimals,
  quantityDecimals
} = useTrigger(computed(() => props.trigger))

const { valueToString: priceToString } = useBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value
})

const { valueToString: quantityToString } = useBigNumberFormatter(quantity, {
  decimalPlaces: quantityDecimals.value
})

const { valueToString: totalToString } = useBigNumberFormatter(total, {
  decimalPlaces: quantityDecimals.value
})

const { valueToString: triggerPriceToString } = useBigNumberFormatter(
  triggerPrice,
  {
    decimalPlaces: quantityDecimals.value
  }
)
</script>

<template>
  <div class="flex p-2 text-xs font-mono">
    <div v-if="market" class="flex-1 flex items-center space-x-2 p-2 font-sans">
      <CommonTokenIcon v-bind="{ token: market.baseToken }" />
      <p>{{ market.ticker }}</p>
    </div>

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

    <div class="flex-1 flex items-center p-2">
      <span v-if="isMarketOrder">{{ $t('trade.market') }}</span>
      <span>{{ priceToString }}</span>
    </div>

    <div class="flex-1 flex items-center p-2">
      {{ quantityToString }}
    </div>

    <div class="flex-1 flex items-center p-2">
      <span>{{ leverage.toFormat(2) }} &times;</span>
    </div>

    <div v-if="market" class="flex-1 flex items-center p-2">
      {{ totalToString }} {{ market.quoteToken.symbol }}
    </div>

    <div class="flex-[2] flex items-center p-2 space-x-2">
      <span class="text-gray-500 text-xs font-sans">
        {{ $t('trade.mark_price') }}
      </span>

      <span
        v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)"
        class="text-white text-xs font-semibold"
      >
        &le;
      </span>
      <span v-else class="text-white text-xs font-semibold"> &ge; </span>

      <span>{{ triggerPriceToString }}</span>
    </div>
  </div>
</template>
