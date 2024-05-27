<script setup lang="ts">
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UiDerivativeMarket,
  TradeAmountOption,
  DerivativesTradeFormField,
  derivativeMarketKey,
  DerivativesTradeForm,
  DerivativeTradeTypes
} from '@/types'
import { ONE_IN_BASE } from '~/app/utils/constants'
import {
  calculateTotalQuantity,
  calculateWorstPrice
} from '@/app/utils/helpers'

const props = defineProps({
  marginWithFee: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  quantity: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const orderbookStore = useOrderbookStore()

const options = [
  {
    display: market.value.baseToken.symbol || '',
    value: TradeAmountOption.Base
  },
  {
    display: market.value.quoteToken.symbol || '',
    value: TradeAmountOption.Quote
  }
]

const positionStore = usePositionStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()
const { userBalancesWithToken } = useBalance()

const decimals = computed(() => {
  return typeValue.value === TradeAmountOption.Base
    ? market.value.quantityDecimals
    : market.value.priceDecimals
})

const isBuy = computed(
  () =>
    derivativeFormValues.value[DerivativesTradeFormField.Side] ===
    TradeDirection.Long
)

const activePosition = computed(() =>
  positionStore.subaccountPositions.find(
    (position) => position.marketId === market.value.marketId
  )
)

const {
  valueToString: quoteBalanceToString,
  valueToBigNumber: quoteBalanceToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    const balance = userBalancesWithToken.value.find(
      (balance) => balance.token.denom === market.value.quoteToken.denom
    )?.availableMargin

    return new BigNumberInWei(balance || 0).toBase(
      market.value.quoteToken.decimals
    )
  })
)

const { value: typeValue } = useStringField({
  name: DerivativesTradeFormField.AmountOption,
  initialValue: TradeAmountOption.Base
})

const { value: amountValue, errorMessage: amountErrorMessage } = useStringField(
  {
    name: DerivativesTradeFormField.Amount,
    initialValue: '',
    dynamicRule: computed(() => {
      if (derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly]) {
        const maxAmount = activePosition.value?.quantity
        const insufficientBalanceRule = `insufficientBalanceCustom:${props.quantity.toFixed()},${maxAmount}`

        const rules = [insufficientBalanceRule]

        return rules.join('|')
      } else {
        const maxAmount = quoteBalanceToBigNumber.value.toFixed()
        const insufficientBalanceRule = `insufficientBalanceCustom:${props.marginWithFee.toFixed()},${maxAmount}`

        const rules = [insufficientBalanceRule]

        return rules.join('|')
      }
    })
  }
)

function setFromPercentage(percentage: number) {
  const isReduceOnly =
    derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly]

  const isLimit =
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.Limit ||
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
      DerivativeTradeTypes.StopLimit

  const isStopMarket =
    derivativeFormValues.value[DerivativesTradeFormField.Type] ===
    DerivativeTradeTypes.StopMarket

  const slippage = derivativeFormValues.value[
    DerivativesTradeFormField.IsSlippageOn
  ]
    ? derivativeFormValues.value[DerivativesTradeFormField.Slippage] || 0
    : 0

  if (
    isReduceOnly &&
    typeValue.value === TradeAmountOption.Base &&
    activePosition.value
  ) {
    amountValue.value = new BigNumberInBase(activePosition.value?.quantity)
      .times(percentage)
      .div(100)
      .toFixed(market.value.quantityDecimals, BigNumber.ROUND_DOWN)

    return
  }

  if (
    isReduceOnly &&
    typeValue.value === TradeAmountOption.Quote &&
    activePosition.value
  ) {
    const records = isBuy ? orderbookStore.sells : orderbookStore.buys

    const { worstPrice } = calculateWorstPrice(
      activePosition.value.quantity,
      records
    )

    const executionPrice = new BigNumberInBase(
      isStopMarket
        ? derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice] ||
          0
        : worstPrice
    )

    const limitPrice = new BigNumberInBase(
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice] || 0
    )

    const executionPriceWithSlippage = isBuy.value
      ? executionPrice.times(1 + Number(slippage) / 100)
      : executionPrice.times(1 - Number(slippage) / 100)

    const totalNotional = isLimit
      ? limitPrice.times(activePosition.value.quantity)
      : executionPriceWithSlippage.times(activePosition.value.quantity)

    amountValue.value = totalNotional
      .times(percentage)
      .div(100)
      .toFixed(market.value.priceDecimals, BigNumber.ROUND_DOWN)

    return
  }

  let executionPrice

  if (isLimit) {
    executionPrice =
      derivativeFormValues.value[DerivativesTradeFormField.LimitPrice]
  }

  if (isStopMarket) {
    executionPrice =
      derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice]
  }

  if (!executionPrice) {
    executionPrice = 0
  }

  const leverage =
    derivativeFormValues.value[DerivativesTradeFormField.Leverage] || 1

  const fee = new BigNumberInBase(market.value.takerFeeRate)
  const feeLeveraged = fee.times(leverage)

  const maxMargin = quoteBalanceToBigNumber.value.div(
    ONE_IN_BASE.plus(feeLeveraged)
  )

  if (typeValue.value === TradeAmountOption.Quote) {
    amountValue.value = maxMargin
      .times(percentage)
      .div(100)
      .times(leverage)
      .toFixed(market.value.priceDecimals, BigNumber.ROUND_DOWN)

    return
  }

  if (typeValue.value === TradeAmountOption.Base && isLimit) {
    const quantity = maxMargin
      .times(leverage)
      .div(executionPrice)
      .times(percentage)
      .div(100)

    amountValue.value = quantity.toFixed(
      market.value.quantityDecimals,
      BigNumber.ROUND_DOWN
    )

    return
  }

  if (typeValue.value === TradeAmountOption.Base && isStopMarket) {
    const slippagePercentage = isBuy.value
      ? new BigNumberInBase(1).plus(Number(slippage) / 100)
      : new BigNumberInBase(1).minus(Number(slippage) / 100)

    const worstPriceWithSlippage = new BigNumberInBase(executionPrice).times(
      slippagePercentage
    )

    const quantity = maxMargin
      .times(leverage)
      .div(worstPriceWithSlippage)
      .times(percentage)
      .div(100)
      .toFixed(market.value.quantityDecimals, BigNumber.ROUND_DOWN)

    amountValue.value = quantity

    return
  }

  const records = isBuy ? orderbookStore.sells : orderbookStore.buys

  const { worstPrice } = calculateTotalQuantity(
    maxMargin.times(leverage).toFixed(),
    records
  )

  const slippagePercentage = isBuy.value
    ? new BigNumberInBase(1).plus(Number(slippage) / 100)
    : new BigNumberInBase(1).minus(Number(slippage) / 100)

  const worstPriceWithSlippage = worstPrice.times(slippagePercentage)

  const quantity = maxMargin
    .times(leverage)
    .div(worstPriceWithSlippage)
    .times(percentage)
    .div(100)
    .toFixed(market.value.quantityDecimals, BigNumber.ROUND_DOWN)

  amountValue.value = quantity
}
</script>

<template>
  <div ref="el" class="space-y-2">
    <div class="flex justify-between items-center">
      <p class="field-label">{{ $t('trade.amount') }}</p>

      <PartialsTradeCommonFormPercentage
        @percentage:change="setFromPercentage"
      />
    </div>

    <AppInputField
      v-bind="{ decimals }"
      v-model="amountValue"
      placeholder="0.00"
    >
      <template #right>
        <AppSelect
          v-model="typeValue"
          wrapper-class=" p-1 rounded select-none"
          v-bind="{
            options
          }"
        >
          <template #default>
            <div>
              <span
                v-if="typeValue === TradeAmountOption.Base"
                class="text-sm select-none"
              >
                {{ market?.baseToken.symbol }}
              </span>
              <span v-else class="text-sm">
                {{ market?.quoteToken.symbol }}
              </span>
            </div>
          </template>

          <template #option="{ option }">
            <span class="text-sm font-semibold">{{ option.display }}</span>
          </template>
        </AppSelect>
      </template>

      <template #bottom>
        <div class="text-right text-xs text-gray-400 border-t pt-2 pb-1">
          <div class="space-x-2">
            <span>{{
              $t('trade.availableAmount', {
                amount: `${quoteBalanceToString} ${market.quoteToken.symbol}`
              })
            }}</span>
          </div>
        </div>
      </template>
    </AppInputField>

    <div v-if="amountErrorMessage" class="error-message capitalize">
      {{ amountErrorMessage }}
    </div>
  </div>
</template>
