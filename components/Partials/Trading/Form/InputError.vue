<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { MaxAmountOnOrderbook, TradeField, TradeForm } from '@/types'
import { tradeErrorMessages } from '@/app/client/utils/validation/trade'

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,
  orderTypeReduceOnly: Boolean,
  availableBalanceError: Boolean,
  markPriceThresholdError: Boolean,
  initialMinMarginRequirementError: Boolean,

  baseAvailableBalance: {
    type: Object as PropType<BigNumberInBase> | undefined,
    default: ZERO_IN_BASE
  },

  formValues: {
    type: Object as PropType<TradeForm>,
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

  quoteAvailableBalance: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  formErrors: {
    type: Object as PropType<Partial<Record<TradeField, string>>>,
    required: true
  }
})

const slippageError = computed(() =>
  [
    tradeErrorMessages.slippageExceed(),
    tradeErrorMessages.slippageTooHigh(),
    tradeErrorMessages.slippageTooLow()
  ].find((error) => Object.values(props.formErrors).includes(error))
)

const error = computed(() => {
  const [error] = Object.values(props.formErrors)

  if (error && error.includes(slippageError.value)) {
    return ''
  }

  return error
})

const availableBalanceGreaterThanAllowableWarning = computed(() => {
  const { totalNotional, totalQuantity } = props.maxAmountOnOrderbook

  if (props.orderTypeReduceOnly && props.maxReduceOnly) {
    return props.maxReduceOnly.gt(totalQuantity)
  }

  const useNotional = props.isBuy || !props.isSpot
  const availableBalance = useNotional
    ? props.quoteAvailableBalance
    : props.baseAvailableBalance

  const percentageAsAmount = new BigNumberInBase(
    props.formValues[TradeField.ProportionalPercentage]
  ).div(100)

  const availableBalanceWithPercentage = percentageAsAmount.gt(0)
    ? availableBalance.times(percentageAsAmount)
    : availableBalance

  const amount = new BigNumberInBase(
    useNotional
      ? props.formValues[TradeField.QuoteAmount]
      : props.formValues[TradeField.BaseAmount]
  )

  const formattedBalance = !props.formValues[TradeField.ProportionalPercentage]
    ? amount
    : availableBalanceWithPercentage

  const maxAmount = useNotional ? totalNotional : totalQuantity

  return formattedBalance.gt(maxAmount)
})
</script>

<template>
  <div>
    <span
      class="text-2xs font-semibold text-red-500"
      data-cy="trading-page-error-text-content"
    >
      <span v-if="error">{{ error }}</span>
      <p
        v-else-if="availableBalanceGreaterThanAllowableWarning"
        class="text-2xs text-orange-500 mb-4"
      >
        {{ $t('trade.balance_higher_than_orderbook_liquidity') }}
      </p>
      <span v-else-if="availableBalanceError">{{
        $t('trade.insufficient_balance')
      }}</span>
      <span v-else-if="initialMinMarginRequirementError">{{
        $t('trade.order_insufficient_margin')
      }}</span>
      <span v-else-if="markPriceThresholdError">{{
        $t('trade.mark_price_invalid')
      }}</span>
    </span>
  </div>
</template>
