<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  calculateWorstPrice,
  calculateTotalQuantity
} from '@/app/utils/helpers'
import {
  BusEvents,
  MarketKey,
  TradeTypes,
  UiSpotMarket,
  SpotTradeForm,
  TradeAmountOption,
  SpotTradeFormField,
  SpotMarketCyTags
} from '@/types'

const orderbookStore = useOrderbookStore()
const spotFormValues = useFormValues<SpotTradeForm>()
const validateLimitField = useValidateField(SpotTradeFormField.Price)
const { userBalancesWithToken } = useBalance()

const market = inject(MarketKey) as Ref<UiSpotMarket>

const { isNotionalLessThanMinNotional } = useSpotWorstPrice(market)

const props = withDefaults(
  defineProps<{
    quantity: BigNumberInBase
    totalWithFee: BigNumberInBase
    minimumAmountInQuote: BigNumberInBase
  }>(),
  {
    quantity: undefined,
    totalWithFee: undefined,
    minimumAmountInQuote: undefined
  }
)

const options = [
  {
    label: market.value.baseToken.symbol || '',
    id: TradeAmountOption.Base
  },
  {
    label: market.value.quoteToken.symbol || '',
    id: TradeAmountOption.Quote
  }
]

const isShowTensMultiplierNote = ref(false)

const { value: typeValue } = useStringField({
  name: SpotTradeFormField.AmountOption,
  initialValue: TradeAmountOption.Base
})

const decimals = computed(() =>
  typeValue.value === TradeAmountOption.Base
    ? market.value.quantityDecimals
    : market.value.priceDecimals
)

const isBuy = computed(
  () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
)

const {
  valueToString: baseBalanceToString,
  valueToBigNumber: baseBalanceToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    const balance = userBalancesWithToken.value.find(
      (balance) => balance.token.denom === market.value.baseToken.denom
    )?.availableBalance

    return sharedToBalanceInToken({
      value: balance || 0,
      decimalPlaces: market.value.baseToken.decimals
    })
  })
)

const {
  valueToString: quoteBalanceToString,
  valueToBigNumber: quoteBalanceToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => {
    const balance = userBalancesWithToken.value.find(
      (balance) => balance.token.denom === market.value.quoteToken.denom
    )?.availableBalance

    return sharedToBalanceInToken({
      value: balance || 0,
      decimalPlaces: market.value.quoteToken.decimals
    })
  })
)

const {
  value: amountValue,
  setValue: setAmountValue,
  errorMessage
} = useStringField({
  name: SpotTradeFormField.Amount,

  dynamicRule: computed(() => {
    const maxAmount = isBuy.value
      ? quoteBalanceToBigNumber.value.toFixed()
      : baseBalanceToBigNumber.value.toFixed()

    const value = isBuy.value ? props.totalWithFee : props.quantity

    const insufficientBalanceRule = `insufficientBalanceCustom:${value.toFixed()},${maxAmount}`

    const minAmountRule = `minAmount:${props.minimumAmountInQuote.toFixed()}`

    const rules = [insufficientBalanceRule]

    if (
      market.value.quantityTensMultiplier >= 1 &&
      typeValue.value === TradeAmountOption.Base
    ) {
      rules.push(
        `quantityTensMultiplier:${market.value.quantityTensMultiplier}`
      )
    }

    if (typeValue.value === TradeAmountOption.Quote) {
      rules.push(minAmountRule)
    }

    return rules.join('|')
  })
})

async function setFromPercentage(percentage: number) {
  const { valid } = await validateLimitField()

  if (!valid) {
    return
  }

  const slippage = spotFormValues.value[SpotTradeFormField.IsSlippageOn]
    ? spotFormValues.value[SpotTradeFormField.Slippage]
    : 0

  if (isBuy.value && typeValue.value === TradeAmountOption.Quote) {
    const amount = quoteBalanceToBigNumber.value
      .times(percentage)
      .div(100)
      .dp(market.value.priceDecimals, BigNumber.ROUND_DOWN)

    setAmountValue(amount.toFixed())

    return
  }

  if (isBuy.value && typeValue.value === TradeAmountOption.Base) {
    const fee = new BigNumberInBase(1).minus(market.value.takerFeeRate)
    const quoteBalance = quoteBalanceToBigNumber.value

    const usableBalance = quoteBalance.times(fee)

    const { worstPrice } = calculateTotalQuantity(
      usableBalance.toFixed(),
      orderbookStore.sells
    )

    const worstPriceWithSlippage = worstPrice.times(1 + Number(slippage) / 100)

    const executionPrice =
      spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
        ? spotFormValues.value[SpotTradeFormField.Price] || 0
        : worstPriceWithSlippage

    const quantity = usableBalance
      .div(executionPrice)
      .times(percentage)
      .div(100)
      .dp(market.value.quantityDecimals, BigNumber.ROUND_DOWN)

    const finalAmount =
      market.value.quantityTensMultiplier < 1
        ? quantity.toFixed()
        : formatAmountToAllowableAmount(
            quantity.toFixed(),
            market.value.quantityTensMultiplier
          )

    setAmountValue(finalAmount)

    return
  }

  if (!isBuy.value && typeValue.value === TradeAmountOption.Base) {
    const amount = baseBalanceToBigNumber.value
      .times(percentage)
      .div(100)
      .dp(market.value.quantityDecimals, BigNumber.ROUND_DOWN)

    const finalAmount =
      market.value.quantityTensMultiplier < 1
        ? amount.toFixed()
        : formatAmountToAllowableAmount(
            amount.toFixed(),
            market.value.quantityTensMultiplier
          )

    setAmountValue(finalAmount)

    return
  }

  if (!isBuy.value && typeValue.value === TradeAmountOption.Quote) {
    const quantity = baseBalanceToBigNumber.value
    const fee = new BigNumberInBase(1).minus(market.value.takerFeeRate)

    const { worstPrice } = calculateWorstPrice(
      quantity.toString(),
      orderbookStore.buys
    )

    const worstPriceWithSlippage = worstPrice.times(1 - Number(slippage) / 100)

    const executionPrice =
      spotFormValues.value[SpotTradeFormField.Type] === TradeTypes.Limit
        ? spotFormValues.value[SpotTradeFormField.Price] || 0
        : worstPriceWithSlippage

    const totalQuote = quantity
      .times(executionPrice)
      .times(fee)
      .times(percentage)
      .div(100)
      .dp(market.value.priceDecimals, BigNumber.ROUND_DOWN)

    setAmountValue(totalQuote.toFixed())
  }
}

function onBlur(baseAmount = '') {
  if (typeValue.value !== TradeAmountOption.Base) {
    return
  }

  if (market.value.quantityTensMultiplier < 1) {
    return
  }

  const formattedAmount = formatAmountToAllowableAmount(
    baseAmount || 0,
    market.value.quantityTensMultiplier
  )

  setAmountValue(formattedAmount)

  isShowTensMultiplierNote.value = formattedAmount !== baseAmount
}

function onClick() {
  isShowTensMultiplierNote.value = false
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
    <div class="flex justify-between items-end">
      <p class="field-label">{{ $t('trade.amount') }}</p>

      <PartialsTradeCommonFormPercentage
        @percentage:change="setFromPercentage"
      />
    </div>

    <AppInputField
      v-bind="{
        decimals
      }"
      v-model="amountValue"
      :placeholder="
        new BigNumberInBase(1)
          .shiftedBy(market.quantityTensMultiplier)
          .toFixed()
      "
      :data-cy="dataCyTag(SpotMarketCyTags.LimitAmountInputField)"
      @blur="onBlur"
      @click="onClick"
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
          <div v-if="isBuy" class="space-x-2">
            <span :data-cy="dataCyTag(SpotMarketCyTags.TokenBuyBalance)">{{
              $t('trade.availableAmount', {
                amount: `${quoteBalanceToString} ${market.quoteToken.symbol}`
              })
            }}</span>
          </div>

          <div v-else class="space-x-2">
            <span :data-cy="dataCyTag(SpotMarketCyTags.TokenSellBalance)">{{
              $t('trade.availableAmount', {
                amount: `${baseBalanceToString} ${market.baseToken.symbol}`
              })
            }}</span>
          </div>
        </div>
      </template>
    </AppInputField>
    <div
      v-if="errorMessage || isNotionalLessThanMinNotional"
      class="error-message capitalize"
    >
      {{
        errorMessage
          ? errorMessage
          : $t('trade.minNotionalError', {
              minNotional: market.minNotionalInToken,
              symbol: market.quoteToken.symbol
            })
      }}
    </div>
    <div
      v-else-if="isShowTensMultiplierNote && amountValue"
      class="text-blue-300 text-sm"
    >
      {{
        $t('trade.tensMultiplierRounded', {
          minTickSize: 10 ** market.quantityTensMultiplier
        })
      }}
    </div>
  </div>
</template>
