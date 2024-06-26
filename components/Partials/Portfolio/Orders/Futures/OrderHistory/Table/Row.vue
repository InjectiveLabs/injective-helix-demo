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

      <div class="flex-[0.5] flex items-center p-2">
        <span class="font-sans">
          {{ type }}
        </span>
      </div>

      <div class="flex-1 flex items-center p-2">
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

      <div class="flex-1 flex items-center p-2 justify-end">
        <span v-if="isMarketOrder" class="font-sans">
          {{ $t('trade.market') }}
        </span>

        <span v-else>
          {{ priceToString }}
        </span>
      </div>

      <div class="flex-1 flex items-center p-2 justify-end">
        {{ quantityToString }}
      </div>

      <div class="flex-1 flex items-center p-2 space-x-1 justify-end">
        <span>
          {{ totalToString }}
        </span>

        <span v-if="market" class="text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </div>

      <div
        :class="[
          order.isConditional
            ? 'flex-col items-end'
            : 'justify-end items-center'
        ]"
        class="flex-1 flex p-2 justify-end"
      >
        <template v-if="order.isConditional">
          <span class="text-gray-500 text-xs font-semibold">
            {{ $t('trade.mark_price') }}
          </span>

          <div>
            <span v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)">
              <span class="text-white text-xs font-semibold">&le;</span>
            </span>
            <span v-else class="text-white text-xs font-semibold">&ge;</span>
            <span>{{ triggerPriceToString }}</span>
          </div>
        </template>

        <template v-else>
          <span>&mdash;</span>
        </template>
      </div>

      <div class="flex-1 flex font-sans items-center p-2">
        <span>{{ orderStatus }}</span>
      </div>
    </div>
  </div>
</template>
