<script lang="ts" setup>
import { PropType, Ref } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  ZERO_IN_BASE,
  UiPriceLevel,
  UiPosition
} from '@injectivelabs/sdk-ui-ts'
import {
  MaxAmountOnOrderbook,
  TradeField,
  TradeForm,
  UiMarketWithToken
} from '@/types'
import {
  TRADE_FORM_QUANTITY_ROUNDING_MODE,
  TRADE_FORM_PRICE_ROUNDING_MODE
} from '@/app/utils/constants'

const formValues = useFormValues() as Ref<TradeForm>
const setFormValues = useSetFormValues()

const props = defineProps({
  isBuy: Boolean,
  isSpot: Boolean,
  isOrderTypeReduceOnly: Boolean,

  baseAvailableBalance: {
    type: Object as PropType<BigNumberInBase> | undefined,
    default: undefined
  },

  feeRate: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
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

  orderbookOrders: {
    type: Array as PropType<UiPriceLevel[]>,
    required: true
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
  'update:amount': [{ isBaseAmount: boolean }]
}>()

const percentages = [25, 50, 75, 100]

const { value: percentage, setValue: setProportionalPercentageValue } =
  useNumberField({
    name: TradeField.ProportionalPercentage,
    initialValue: 0,
    rule: ''
  })

const spotAvailableBalanceGreaterThanOrderbook = computed(() => {
  const { totalNotional, totalQuantity } = props.maxAmountOnOrderbook

  const percentageToNumber = new BigNumberInBase(percentage.value).div(100)

  return props.isBuy
    ? props.quoteAvailableBalance.times(percentageToNumber).gt(totalNotional)
    : props.baseAvailableBalance?.times(percentageToNumber).gt(totalQuantity)
})

const derivativeAvailableBalanceGreaterThanOrderbook = computed(() => {
  const { totalNotional } = props.maxAmountOnOrderbook

  const percentageToNumber = new BigNumberInBase(percentage.value).div(100)

  return props.quoteAvailableBalance.times(percentageToNumber).gt(totalNotional)
})

const feeRate = computed(() =>
  props.feeRate.lt(0) ? ZERO_IN_BASE : props.feeRate
)

const balanceToUpdateSpotWithFees = computed(() => {
  const percentageFormatted = new BigNumberInBase(percentage.value).div(100)
  const availableBalance = props.isBuy
    ? props.quoteAvailableBalance
    : props.baseAvailableBalance

  const balanceToUpdateSpot = new BigNumberInBase(
    availableBalance || ZERO_IN_BASE
  ).times(percentageFormatted)

  return props.isBuy
    ? balanceToUpdateSpot.minus(balanceToUpdateSpot.times(feeRate.value))
    : balanceToUpdateSpot
})

const balanceToUpdateDerivativesWithFees = computed(() => {
  const percentageFormatted = new BigNumberInBase(percentage.value).div(100)

  const balanceToUpdateDerivative = new BigNumberInBase(
    props.quoteAvailableBalance || ZERO_IN_BASE
  )
    .times(percentageFormatted)
    .times(formValues.value[TradeField.Leverage])

  return balanceToUpdateDerivative.minus(
    balanceToUpdateDerivative.times(feeRate.value)
  )
})

function changeAmountFromPercentageForReduceOnly() {
  if (!props.maxReduceOnly) {
    return
  }

  const { totalQuantity } = props.maxAmountOnOrderbook

  const maxReduceOnlyFromPercentage = props.maxReduceOnly
    .times(percentage.value)
    .dividedBy(100)

  const amount = BigNumberInBase.minimum(
    maxReduceOnlyFromPercentage,
    totalQuantity
  )

  setFormValues({
    [TradeField.BaseAmount]: amount.toFixed(
      props.market.quantityDecimals,
      TRADE_FORM_QUANTITY_ROUNDING_MODE
    )
  })

  emit('update:amount', { isBaseAmount: true })
}

function derivativePercentageChange() {
  // compare percent click amount to the max allowable quantity
  const field = derivativeAvailableBalanceGreaterThanOrderbook.value
    ? TradeField.BaseAmount
    : TradeField.QuoteAmount

  const amount = derivativeAvailableBalanceGreaterThanOrderbook.value
    ? props.maxAmountOnOrderbook.totalQuantity
    : balanceToUpdateDerivativesWithFees.value

  const decimals = derivativeAvailableBalanceGreaterThanOrderbook.value
    ? props.market.quantityDecimals
    : props.market.priceDecimals

  const roundingMode = derivativeAvailableBalanceGreaterThanOrderbook.value
    ? TRADE_FORM_QUANTITY_ROUNDING_MODE
    : TRADE_FORM_PRICE_ROUNDING_MODE

  setFormValues({
    [field]: amount.toFixed(decimals, roundingMode)
  })

  emit('update:amount', {
    isBaseAmount: derivativeAvailableBalanceGreaterThanOrderbook.value
  })
}

function spotPercentageChange() {
  // compare percent click amount to the max allowable quantity
  const field =
    spotAvailableBalanceGreaterThanOrderbook.value || !props.isBuy
      ? TradeField.BaseAmount
      : TradeField.QuoteAmount

  const amount = spotAvailableBalanceGreaterThanOrderbook.value
    ? props.maxAmountOnOrderbook.totalQuantity
    : balanceToUpdateSpotWithFees.value

  const decimals =
    spotAvailableBalanceGreaterThanOrderbook.value || !props.isBuy
      ? props.market.quantityDecimals
      : props.market.priceDecimals

  const roundingMode =
    spotAvailableBalanceGreaterThanOrderbook.value || !props.isBuy
      ? TRADE_FORM_QUANTITY_ROUNDING_MODE
      : TRADE_FORM_PRICE_ROUNDING_MODE

  setFormValues({
    [field]: amount.toFixed(decimals, roundingMode)
  })

  emit('update:amount', {
    isBaseAmount:
      derivativeAvailableBalanceGreaterThanOrderbook.value || !props.isBuy
  })
}

function onPercentageChange(percentage: number) {
  changeFromPercentage(percentage)
}

function changeFromPercentage(percentage: number) {
  setProportionalPercentageValue(percentage)

  if (props.isOrderTypeReduceOnly) {
    return changeAmountFromPercentageForReduceOnly()
  }

  if (!props.isSpot) {
    return derivativePercentageChange()
  }

  return spotPercentageChange()
}

watch(
  () => props.feeRate,
  () => {
    if (!percentage.value) {
      return
    }

    changeFromPercentage(percentage.value)
  }
)

watch(
  () => formValues.value[TradeField.BaseAmount],
  () => {
    if (props.market.quantityTensMultiplier < 1 || !percentage.value) {
      return
    }

    setFormValues({
      [TradeField.BaseAmount]: formatAmountToAllowableAmount(
        formValues.value[TradeField.BaseAmount],
        props.market.quantityTensMultiplier
      )
    })

    emit('update:amount', {
      isBaseAmount: true
    })
  }
)
</script>

<template>
  <div class="text-xs text-gray-400 flex items-center font-mono">
    <span
      v-for="(percent, index) in percentages"
      :key="`percentage-${index}`"
      :data-cy="`trading-page-percentage-selector-${percent}-span`"
      class="mr-1 cursor-pointer"
      @click.stop="onPercentageChange(percent)"
    >
      {{ percent }}%
    </span>
  </div>
</template>
