<script setup lang="ts">
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { dataCyTag } from '@shared/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  calculateWorstPrice,
  calculateTotalQuantity
} from '@/app/utils/helpers'
import { ONE_IN_BASE } from '@/app/utils/constants'
import {
  BusEvents,
  MarketKey,
  TradeAmountOption,
  UiDerivativeMarket,
  DerivativesTradeForm,
  DerivativeTradeTypes,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'

const positionStore = usePositionStore()
const orderbookStore = useOrderbookStore()
const derivativeFormValues = useFormValues<DerivativesTradeForm>()

const validateLimitField = useValidateField(
  DerivativesTradeFormField.LimitPrice
)
const validateTriggerField = useValidateField(
  DerivativesTradeFormField.TriggerPrice
)
const market = inject(MarketKey) as Ref<UiDerivativeMarket>

const { markPrice } = useDerivativeLastPrice(market)
const { activeSubaccountBalancesWithToken } = useBalance()
const { isNotionalLessThanMinNotional } = useDerivativeWorstPrice(market)

const props = withDefaults(
  defineProps<{
    quantity: BigNumberInBase
    worstPrice: BigNumberInBase
    marginWithFee: BigNumberInBase
    minimumAmountInQuote: BigNumberInBase
  }>(),
  {}
)

const options = [
  {
    label:
      market.value.baseToken.overrideSymbol ||
      market.value.baseToken.symbol ||
      '',
    id: TradeAmountOption.Base
  },
  {
    label: market.value.quoteToken.symbol || '',
    id: TradeAmountOption.Quote
  }
]

const decimals = computed(() =>
  typeValue.value === TradeAmountOption.Base
    ? market.value.quantityDecimals
    : market.value.priceDecimals
)

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
    const balance = activeSubaccountBalancesWithToken.value.find(
      (balance) => balance.token.denom === market.value.quoteToken.denom
    )?.availableBalance

    return new BigNumberInWei(balance || 0).toBase(
      market.value.quoteToken.decimals
    )
  })
)

const { isMarkPriceThresholdError } = useMarkPriceThresholdError({
  isBuy,
  market,
  markPrice,
  price: computed(() => props.worstPrice),
  quantity: computed(() => props.quantity),
  marginWithFee: computed(() => props.marginWithFee),
  type: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.Type]
  ),
  triggerPrice: computed(
    () => derivativeFormValues.value[DerivativesTradeFormField.TriggerPrice]
  )
})

const { value: typeValue } = useStringField({
  name: DerivativesTradeFormField.AmountOption,
  initialValue: TradeAmountOption.Base
})

const {
  value: amountValue,
  errorMessage: amountErrorMessage,
  setValue: setAmountValue
} = useStringField({
  name: DerivativesTradeFormField.Amount,
  initialValue: '',
  dynamicRule: computed(() => {
    if (derivativeFormValues.value[DerivativesTradeFormField.ReduceOnly]) {
      const maxAmount = activePosition.value?.quantity

      return `insufficientBalanceCustom:${props.quantity.toFixed()},${maxAmount}`
    } else {
      const maxAmount = quoteBalanceToBigNumber.value.toFixed()
      const insufficientBalanceRule = `insufficientBalanceCustom:${props.marginWithFee.toFixed()},${maxAmount}`

      if (typeValue.value === TradeAmountOption.Quote) {
        return `${insufficientBalanceRule}|minAmount:${props.minimumAmountInQuote.toFixed()}`
      }

      return insufficientBalanceRule
    }
  })
})

async function setFromPercentage(percentage: number) {
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

  if (isLimit) {
    const { valid } = await validateLimitField()

    if (!valid) {
      return
    }
  }

  if (isStopMarket) {
    const { valid } = await validateTriggerField()

    if (!valid) {
      return
    }
  }

  const slippage =
    derivativeFormValues.value[DerivativesTradeFormField.Slippage] || 0

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

onMounted(() => {
  useEventBus(BusEvents.OrderbookNotionalClick).on((totalNotional) => {
    if (typeValue.value === TradeAmountOption.Quote) {
      setAmountValue(totalNotional as string)
    }
  })

  useEventBus(BusEvents.OrderbookSizeClick).on((totalQuantity) => {
    if (typeValue.value === TradeAmountOption.Base) {
      setAmountValue(totalQuantity as string)
    }
  })
})
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
      :placeholder="
        new BigNumberInBase(1)
          .shiftedBy(market.quantityTensMultiplier)
          .toFixed()
      "
      :data-cy="dataCyTag(PerpetualMarketCyTags.LimitAmountInputField)"
    >
      <template #right>
        <USelectMenu
          v-model="typeValue"
          :options="options"
          variant="none"
          value-attribute="id"
        />
      </template>

      <template #bottom>
        <div class="text-right text-xs text-coolGray-450 pt-2 pb-1">
          <div
            class="space-x-1 inline-flex"
            :data-cy="dataCyTag(PerpetualMarketCyTags.AvailableBalance)"
          >
            <span>
              {{
                $t('trade.availableAmount', {
                  amount: quoteBalanceToString
                })
              }}
            </span>

            <PartialsCommonBalanceDisplay
              v-bind="{
                token: market.quoteToken,
                value: market.quoteToken.symbol
              }"
            />
          </div>
        </div>
      </template>
    </AppInputField>

    <p
      v-if="isMarkPriceThresholdError"
      class="error-message first-letter:capitalize"
    >
      {{ $t('trade.mark_price_invalid') }}
    </p>

    <p
      v-else-if="amountErrorMessage"
      class="error-message first-letter:capitalize"
    >
      {{ amountErrorMessage }}
    </p>

    <p
      v-else-if="isNotionalLessThanMinNotional"
      class="error-message first-letter:capitalize"
    >
      {{
        $t('trade.minNotionalError', {
          symbol: market.quoteToken.symbol,
          minNotional: market.minNotionalInToken
        })
      }}
    </p>
  </div>
</template>
