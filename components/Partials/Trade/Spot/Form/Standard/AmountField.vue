<script setup lang="ts">
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  UiSpotMarket,
  spotMarketKey,
  TradeAmountOption,
  SpotTradeFormField,
  SpotTradeForm,
  TradeTypes,
  BusEvents
} from '@/types'
import {
  calculateTotalQuantity,
  calculateWorstPrice
} from '@/app/utils/helpers'

const props = defineProps({
  totalWithFee: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  quantity: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  minimumAmountInQuote: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const market = inject(spotMarketKey) as Ref<UiSpotMarket>
const isShowTensMultiplierNote = ref(false)

const { userBalancesWithToken } = useBalance()
const spotFormValues = useFormValues<SpotTradeForm>()
const orderbookStore = useOrderbookStore()

const validateLimitField = useValidateField(SpotTradeFormField.Price)

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
    )?.availableMargin

    return new BigNumberInWei(balance || 0).toBase(
      market.value.baseToken.decimals
    )
  })
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
      @blur="onBlur"
      @click="onClick"
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
          <div v-if="isBuy" class="space-x-2">
            <span>{{
              $t('trade.availableAmount', {
                amount: `${quoteBalanceToString} ${market.quoteToken.symbol}`
              })
            }}</span>
          </div>

          <div v-else class="space-x-2">
            <span>{{
              $t('trade.availableAmount', {
                amount: `${baseBalanceToString} ${market.baseToken.symbol}`
              })
            }}</span>
          </div>
        </div>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message capitalize">
      {{ errorMessage }}
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
