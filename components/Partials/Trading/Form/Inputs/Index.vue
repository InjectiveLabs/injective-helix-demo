<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiPriceLevel,
  UiPosition,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  MaxAmountOnOrderbook,
  TradeField,
  TradeForm,
  TradeFormValue,
  UiMarketWithToken
} from '@/types'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

const props = defineProps({
  isBase: Boolean,
  isBuy: Boolean,
  isSpot: Boolean,
  orderTypeReduceOnly: Boolean,

  amountStep: {
    type: String,
    required: true
  },

  baseAvailableBalance: {
    type: Object as PropType<BigNumberInBase> | undefined,
    default: undefined
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
  }
})

const emit = defineEmits<{
  (
    e: 'update:amount',
    { amount, isBase }: { amount?: string; isBase: boolean }
  ): void
  (e: 'update:formValue', { field, value }: TradeFormValue): void
}>()

const {
  tradingTypeStopLimit,
  tradingTypeStopMarket,
  tradingTypeLimit: derivativeTradingTypeLimit
} = useDerivativeFormFormatter(computed(() => props.formValues))

const orderbookOrders = computed<UiPriceLevel[]>(() => {
  const orderbook = props.isSpot
    ? spotStore.orderbook
    : derivativeStore.orderbook

  if (props.isBuy) {
    return orderbook?.sells || []
  }

  return orderbook?.buys || []
})

const { tradingTypeLimit: spotTradingTypeLimit } = useSpotFormFormatter(
  computed(() => props.formValues)
)

const tradingTypeLimit = props.isSpot
  ? spotTradingTypeLimit
  : derivativeTradingTypeLimit

function updateAmount({
  amount,
  isBase
}: {
  amount?: string
  isBase: boolean
}) {
  emit('update:amount', { amount, isBase })
}

function updateFormValue({ field, value }: TradeFormValue) {
  emit('update:formValue', { field, value })
}
</script>

<template>
  <div>
    <PartialsTradingFormInputsPrice
      v-if="tradingTypeStopLimit || tradingTypeStopMarket"
      v-bind="{
        formValues,
        isBase,
        isSpot,
        lastTradedPrice,
        market,
        priceStep,
        priceFieldName: TradeField.TriggerPrice
      }"
      @update:amount="updateAmount"
      @update:formValue="updateFormValue"
    />

    <PartialsTradingFormInputsPrice
      v-if="tradingTypeLimit || tradingTypeStopLimit"
      v-bind="{
        formValues,
        isBase,
        isSpot,
        lastTradedPrice,
        market,
        priceStep,
        tradingTypeLimit,
        tradingTypeStopLimit,
        priceFieldName: TradeField.LimitPrice
      }"
      @update:amount="updateAmount"
    />
  </div>
  <div class="flex gap-3">
    <PartialsTradingFormInputsBaseAmount
      v-bind="{
        amountStep,
        baseAvailableBalance,
        isBase,
        isBuy,
        isSpot,
        formValues,
        tradingTypeLimit,
        tradingTypeStopLimit,
        market,
        orderbookOrders,
        baseAmountFieldName: TradeField.BaseAmount
      }"
      @update:amount="updateAmount"
      @update:formValue="updateFormValue"
    />
    <div class="flex flex-1 flex-col items-end">
      <PartialsTradingFormPercentageOptions
        class="mb-2"
        v-bind="{
          baseAvailableBalance,
          feeRate,
          formValues,
          isBuy,
          isSpot,
          market,
          maxAmountOnOrderbook,
          maxReduceOnly,
          orderbookOrders,
          orderTypeReduceOnly,
          position,
          quoteAvailableBalance,
          percentageFieldName: TradeField.ProportionalPercentage
        }"
        @update:amount="updateAmount"
        @update:formValue="updateFormValue"
      />
      <PartialsTradingFormInputsQuoteAmount
        v-bind="{
          amountStep,
          fees,
          formValues,
          market,
          quoteAvailableBalance,
          quoteAmountFieldName: TradeField.QuoteAmount
        }"
        @update:amount="updateAmount"
        @update:formValue="updateFormValue"
      />
    </div>
  </div>
</template>
