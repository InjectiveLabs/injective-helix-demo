<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketType, UiPosition, ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  BusEvents,
  MaxAmountOnOrderbook,
  OrderBookPriceAndType,
  OrderBookNotionalAndType,
  OrderBookQuantityAndType,
  TradeExecutionType,
  TradeField,
  TradeForm,
  UiMarketWithToken
} from '@/types'

const formValues = useFormValues() as Ref<TradeForm>

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

function updateOrderSide(isBuy: boolean) {
  formValues.value[TradeField.OrderSide] = isBuy
    ? OrderSide.Sell
    : OrderSide.Buy
}

function onOrderbookNotionalClick(notionalAndType: OrderBookNotionalAndType) {
  updateOrderSide(notionalAndType.isBuy)

  formValues.value[TradeField.TradingType] = TradeExecutionType.Market
  formValues.value[TradeField.QuoteAmount] = notionalAndType.total

  updateAmount({ isBaseAmount: false })
}

function onOrderbookSizeClick(quantityAndOrderSide: OrderBookQuantityAndType) {
  updateOrderSide(quantityAndOrderSide.isBuy)

  formValues.value[TradeField.BaseAmount] = quantityAndOrderSide.quantity

  updateAmount({ isBaseAmount: true })
}

function onOrderbookPriceClick(priceAndOrderSide: OrderBookPriceAndType) {
  if (
    formValues.value[TradeField.TradingType] === TradeExecutionType.LimitFill ||
    formValues.value[TradeField.TradingType] === TradeExecutionType.StopLimit
  ) {
    formValues.value[TradeField.LimitPrice] = priceAndOrderSide.price

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
    />

    <PartialsTradingFormInputError
      v-bind="{
        availableBalanceError,
        baseAvailableBalance,
        quoteAvailableBalance,
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
    />
  </div>
</template>
