<script lang="ts" setup>
import { PropType, Ref } from 'vue'
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
  UiMarketWithToken
} from '@/types'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,
  isBaseAmount: Boolean,
  orderTypeReduceOnly: Boolean,

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

  quoteAvailableBalance: {
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

const {
  tradingTypeStopLimit,
  tradingTypeStopMarket,
  tradingTypeLimit: derivativeTradingTypeLimit
} = useDerivativeFormFormatter(formValues)

const { tradingTypeLimit: spotTradingTypeLimit } =
  useSpotFormFormatter(formValues)

const amountStep = computed(() =>
  new BigNumberInBase(1)
    .shiftedBy(props.market.quantityTensMultiplier)
    .toFixed()
)

const priceStep = computed(() =>
  new BigNumberInBase(1).shiftedBy(-props.market.priceDecimals).toFixed()
)

const orderbookOrders = computed<UiPriceLevel[]>(() => {
  const buys = props.isSpot ? spotStore.buys : derivativeStore.buys
  const sells = props.isSpot ? spotStore.sells : derivativeStore.sells

  return props.isBuy ? sells : buys
})

const tradingTypeLimit = props.isSpot
  ? spotTradingTypeLimit
  : derivativeTradingTypeLimit

function updateAmount({
  amount,
  isBaseAmount
}: {
  amount?: string
  isBaseAmount: boolean
}) {
  emit('update:amount', { amount, isBaseAmount })
}
</script>

<template>
  <div>
    <PartialsTradingFormInputsPrice
      v-if="tradingTypeStopLimit || tradingTypeStopMarket"
      v-bind="{
        isBaseAmount,
        isSpot,
        lastTradedPrice,
        market,
        priceStep,
        priceFieldName: TradeField.TriggerPrice
      }"
      @update:amount="updateAmount"
    />

    <PartialsTradingFormInputsPrice
      v-if="tradingTypeLimit || tradingTypeStopLimit"
      v-bind="{
        isBaseAmount,
        isBuy,
        isSpot,
        lastTradedPrice,
        market,
        orderbookOrders,
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
        isBaseAmount,
        isBuy,
        isSpot,
        tradingTypeLimit,
        tradingTypeStopLimit,
        market,
        orderbookOrders,
        baseAmountFieldName: TradeField.BaseAmount
      }"
      @update:amount="updateAmount"
    />
    <div class="flex flex-1 flex-col items-end">
      <PartialsTradingFormPercentageOptions
        class="mb-2"
        v-bind="{
          baseAvailableBalance,
          feeRate,
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
      />
      <PartialsTradingFormInputsQuoteAmount
        v-bind="{
          amountStep,
          fees,
          market,
          quoteAvailableBalance,
          quoteAmountFieldName: TradeField.QuoteAmount
        }"
        @update:amount="updateAmount"
      />
    </div>
  </div>
</template>
