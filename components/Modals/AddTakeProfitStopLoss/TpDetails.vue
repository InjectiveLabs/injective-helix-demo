<script setup lang="ts">
import { PositionV2 } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiDerivativeMarket, ConditionalOrderSide } from '@/types'

const derivativeStore = useDerivativeStore()

const props = withDefaults(
  defineProps<{
    isBuy: boolean
    tpQuantity?: string
    position: PositionV2
    tpTriggerPrice?: string
    takeProfitValue: string
    market: UiDerivativeMarket
    entryPrice: BigNumberInBase
  }>(),
  { tpQuantity: '', tpTriggerPrice: '' }
)

const getTpQuantity = computed(() => {
  const tpOrderQuantity =
    derivativeStore.subaccountConditionalOrders.find(
      (order) =>
        order.marketId === props.position.marketId &&
        (order.orderType === ConditionalOrderSide.TakeBuy ||
          order.orderType === ConditionalOrderSide.TakeSell)
    )?.quantity || 0

  return props.tpTriggerPrice ? tpOrderQuantity : props.tpQuantity
})

const hasNoTpQuantity = computed(() =>
  new BigNumberInBase(getTpQuantity.value || 0).isZero()
)

const takeProfitPnl = computed(() => {
  const takeProfitPrice = props.tpTriggerPrice
    ? new BigNumberInBase(props.tpTriggerPrice)
    : new BigNumberInBase(props.takeProfitValue || 0)

  const takeProfitTotal = takeProfitPrice.times(getTpQuantity.value || 0)
  const entryTotal = props.entryPrice.times(getTpQuantity.value || 0)

  return props.isBuy
    ? takeProfitTotal.minus(entryTotal)
    : entryTotal.minus(takeProfitTotal)
})
</script>

<template>
  <i18n-t
    tag="p"
    keypath="trade.takeProfitDetails"
    class="text-xs text-coolGray-400"
  >
    <template #price>
      <span class="inline-flex">
        <span v-if="!takeProfitValue && !tpTriggerPrice"> &mdash;</span>
        <AppAmount
          v-else
          v-bind="{
            amount: tpTriggerPrice || takeProfitValue,
            decimalPlaces: market.priceDecimals
          }"
        />
      </span>
    </template>

    <template #quantity>
      <span class="inline-flex gap-1">
        <AppAmount
          v-bind="{
            amount: getTpQuantity,
            decimalPlaces: market.priceDecimals
          }"
        />
        <span>{{ market.baseToken.symbol }}</span>
      </span>
    </template>
  </i18n-t>

  <p class="text-xs">
    <span>{{ $t('trade.profitLoss') }}: </span>

    <span v-if="(!takeProfitValue && !tpTriggerPrice) || hasNoTpQuantity">
      &mdash;
    </span>
    <span
      v-else
      :class="[takeProfitPnl.gte(0) ? 'text-green-500' : 'text-red-500']"
      class="font-bold inline-flex gap-1"
    >
      <AppAmount
        v-bind="{
          amount: takeProfitPnl.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
      />
      <span>{{ market.quoteToken.symbol }}</span>
    </span>
  </p>
</template>
