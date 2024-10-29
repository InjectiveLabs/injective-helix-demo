<script setup lang="ts">
import { SpotOrderHistory } from '@injectivelabs/sdk-ts'
import { UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = withDefaults(
  defineProps<{
    order: SpotOrderHistory
  }>(),
  {}
)

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

const { valueToFixed: priceToFixed } = useSharedBigNumberFormatter(price, {
  decimalPlaces: priceDecimals.value,
  displayAbsoluteDecimalPlace: true
})

const { valueToFixed: quantityToFixed } = useSharedBigNumberFormatter(
  quantity,
  {
    decimalPlaces: quantityDecimals.value
  }
)

const { valueToFixed: totalToFixed } = useSharedBigNumberFormatter(total, {
  decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
})

const { valueToFixed: triggerPriceToFixed } = useSharedBigNumberFormatter(
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
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: priceToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.amount') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: quantityToFixed
          }"
        />
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.total') }}</p>
      <p class="font-mono">
        <AppAmount
          v-bind="{
            amount: totalToFixed
          }"
        />
        <span class="text-coolGray-500 ml-1">
          {{ market?.quoteToken.symbol }}
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4">
      <p>{{ $t('trade.triggerCondition') }}</p>
      <p>
        <span v-if="triggerPrice.eq(0)"> &mdash; </span>
        <span v-else class="font-mono">
          <AppAmount
            v-bind="{
              showZeroAsEmDash: true,
              amount: triggerPriceToFixed
            }"
          />
        </span>
      </p>
    </div>

    <div class="justify-between flex items-center px-2 py-4 font-sans">
      <p>{{ $t('trade.orderStatus') }}</p>
      <p>{{ orderStatus }}</p>
    </div>
  </div>
</template>
