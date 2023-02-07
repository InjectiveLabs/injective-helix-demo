<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  DerivativeOrderSide,
  MarketType,
  SpotOrderSide,
  UiPosition,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  BusEvents,
  MaxAmountOnOrderbook,
  TradeFormValue,
  OrderBookPriceAndType,
  OrderBookNotionalAndType,
  OrderBookQuantityAndType,
  TradeExecutionType,
  TradeField,
  TradeForm,
  UiMarketWithToken
} from '@/types'

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,
  isBaseAmount: Boolean,
  showReduceOnly: Boolean,
  orderTypeReduceOnly: Boolean,
  availableBalanceError: Boolean,
  markPriceThresholdError: Boolean,
  initialMinMarginRequirementError: Boolean,

  amountStep: {
    type: String,
    required: true
  },

  baseAvailableBalance: {
    type: Object as PropType<BigNumberInBase> | undefined,
    default: undefined
  },

  executionPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  feeRate: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  fees: {
    type: Object as PropType<BigNumberInBase>,
    default: undefined
  },

  formValues: {
    type: Object as PropType<TradeForm>,
    required: true
  },

  formErrors: {
    type: Object as PropType<Partial<Record<TradeField, string>>>,
    required: true
  },

  lastTradedPrice: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  maxAmountOnOrderbook: {
    type: Object as PropType<MaxAmountOnOrderbook>,
    required: true
  },

  maxReduceOnly: {
    type: Object as PropType<BigNumberInBase | undefined>,
    default: undefined
  },

  position: {
    type: Object as PropType<UiPosition> | undefined,
    default: undefined
  },

  priceStep: {
    type: String,
    required: true
  },

  quoteAvailableBalance: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  worstPriceWithSlippage: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const emit = defineEmits<{
  (
    e: 'update:amount',
    { amount, isBaseAmount }: { amount?: string; isBaseAmount: boolean }
  ): void
  (e: 'update:formValue', { field, value }: TradeFormValue): void
}>()

const isSpot = props.market.type === MarketType.Spot

onMounted(() => {
  useEventBus<OrderBookPriceAndType>(BusEvents.OrderbookPriceClick).on(
    onOrderbookPriceClick
  )
  useEventBus<OrderBookQuantityAndType>(BusEvents.OrderbookSizeClick).on(
    onOrderbookSizeClick
  )
  useEventBus<OrderBookNotionalAndType>(BusEvents.OrderbookNotionalClick).on(
    onOrderbookNotionalClick
  )
})

function updateAmount({
  amount,
  isBaseAmount
}: {
  amount?: string
  isBaseAmount: boolean
}) {
  emit('update:amount', { amount, isBaseAmount })
}

function updateFormValue({ field, value }: TradeFormValue) {
  emit('update:formValue', { field, value })
}

function updateOrderType(isBuy: boolean) {
  const orderTypeBuy = isSpot ? SpotOrderSide.Buy : DerivativeOrderSide.Buy
  const orderTypeSell = isSpot ? SpotOrderSide.Sell : DerivativeOrderSide.Sell

  updateFormValue({
    field: TradeField.OrderType,
    value: isBuy ? orderTypeSell : orderTypeBuy
  })
}

function onOrderbookNotionalClick(notionalAndType: OrderBookNotionalAndType) {
  updateOrderType(notionalAndType.isBuy)

  updateFormValue({
    field: TradeField.TradingType,
    value: TradeExecutionType.Market
  })

  updateFormValue({
    field: TradeField.QuoteAmount,
    value: notionalAndType.total
  })

  updateAmount({ isBaseAmount: false })
}

function onOrderbookSizeClick(quantityAndOderType: OrderBookQuantityAndType) {
  updateOrderType(quantityAndOderType.isBuy)

  updateFormValue({
    field: TradeField.BaseAmount,
    value: quantityAndOderType.quantity
  })

  updateAmount({ isBaseAmount: true })
}

function onOrderbookPriceClick(priceAndOrderType: OrderBookPriceAndType) {
  if (
    props.formValues[TradeField.TradingType] === TradeExecutionType.LimitFill ||
    props.formValues[TradeField.TradingType] === TradeExecutionType.StopLimit
  ) {
    updateFormValue({
      field: TradeField.LimitPrice,
      value: priceAndOrderType.price
    })

    updateAmount({ isBaseAmount: true })
  }
}
</script>

<template>
  <div>
    <PartialsTradingFormInputs
      v-bind="{
        amountStep,
        baseAvailableBalance,
        feeRate,
        fees,
        formValues,
        isBaseAmount,
        isBuy,
        isSpot,
        lastTradedPrice,
        market,
        maxAmountOnOrderbook,
        maxReduceOnly,
        orderTypeReduceOnly,
        position,
        priceStep,
        quoteAvailableBalance
      }"
      @update:amount="updateAmount"
      @update:formValue="updateFormValue"
    />

    <PartialsTradingFormInputError
      v-bind="{
        availableBalanceError,
        baseAvailableBalance,
        quoteAvailableBalance,
        formErrors,
        formValues,
        initialMinMarginRequirementError,
        isBuy,
        isSpot,
        orderTypeReduceOnly,
        markPriceThresholdError,
        maxAmountOnOrderbook,
        maxReduceOnly
      }"
    />

    <PartialsTradingDerivativesTradingOrderLeverage
      v-show="
        !orderTypeReduceOnly &&
        !isSpot &&
        market.subType !== MarketType.BinaryOptions
      "
      class="mt-6"
      v-bind="{
        executionPrice,
        formValues,
        isBuy,
        market,
        worstPriceWithSlippage,
        leverageFieldName: TradeField.Leverage
      }"
    />

    <PartialsTradingFormAdvancedSettings
      v-bind="{
        formValues,
        isSpot,
        reduceOnlyDisabled: !showReduceOnly
      }"
      @update:amount="updateAmount"
      @update:formValue="updateFormValue"
    />
  </div>
</template>
