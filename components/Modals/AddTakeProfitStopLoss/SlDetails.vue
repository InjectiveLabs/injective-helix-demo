<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiDerivativeMarket, ConditionalOrderSide } from '@/types'

const derivativeStore = useDerivativeStore()

const props = withDefaults(
  defineProps<{
    isBuy: boolean
    slQuantity: string
    position: PositionV2
    stopLossValue: string
    slTriggerPrice?: string
    market: UiDerivativeMarket
    entryPrice: BigNumberInBase
  }>(),
  { slQuantity: '', slTriggerPrice: '' }
)

const getSlQuantity = computed(() => {
  const slOrderQuantity =
    derivativeStore.subaccountConditionalOrders.find(
      (order) =>
        (order.marketId === props.position.marketId &&
          order.orderType === ConditionalOrderSide.StopBuy) ||
        order.orderType === ConditionalOrderSide.StopSell
    )?.quantity || 0

  return props.slTriggerPrice ? slOrderQuantity : props.slQuantity
})

const hasNoSlQuantity = computed(() =>
  new BigNumberInBase(getSlQuantity.value || 0).isZero()
)

const stopLossPnl = computed(() => {
  const stopLossPrice = props.slTriggerPrice
    ? new BigNumberInBase(props.slTriggerPrice)
    : new BigNumberInBase(props.stopLossValue || 0)

  const stopLossTotal = stopLossPrice.times(getSlQuantity.value || 0)
  const entryTotal = props.entryPrice.times(getSlQuantity.value || 0)

  return props.isBuy
    ? stopLossTotal.minus(entryTotal)
    : entryTotal.minus(stopLossTotal)
})
</script>

<template>
  <i18n-t
    tag="p"
    keypath="trade.stopLossDetails"
    class="text-xs text-coolGray-400"
  >
    <template #price>
      <span class="inline-flex">
        <span v-if="!stopLossValue && !slTriggerPrice"> &mdash;</span>
        <AppAmount
          v-else
          v-bind="{
            amount: slTriggerPrice || stopLossValue,
            decimalPlaces: market.priceDecimals
          }"
        />
      </span>
    </template>

    <template #quantity>
      <span class="inline-flex gap-1">
        <AppAmount
          v-bind="{
            amount: getSlQuantity,
            decimalPlaces: market.priceDecimals
          }"
        />
        <span>{{ market.baseToken.symbol }}</span>
      </span>
    </template>
  </i18n-t>

  <p class="text-xs">
    <span>{{ $t('trade.profitLoss') }}: </span>

    <span v-if="(!stopLossValue && !slTriggerPrice) || hasNoSlQuantity">
      &dash;
    </span>
    <span
      v-else
      :class="[stopLossPnl.gte(0) ? 'text-green-500' : 'text-red-500']"
      class="font-bold inline-flex gap-1"
    >
      <AppAmount
        v-bind="{
          amount: stopLossPnl.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
      />
      <span>{{ market.quoteToken.symbol }}</span>
    </span>
  </p>
</template>
