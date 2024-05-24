<script setup lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { OrderSide } from '@injectivelabs/ts-types'
import {
  UiSpotMarket,
  spotMarketKey,
  TradeAmountOption,
  SpotTradeFormField,
  SpotTradeForm
} from '@/types'

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

const { userBalancesWithToken } = useBalance()
const spotFormValues = useFormValues<SpotTradeForm>()

const { value: typeValue } = useStringField({
  name: SpotTradeFormField.AmountOption,
  initialValue: TradeAmountOption.Base
})

const decimals = computed(() => {
  return typeValue.value === TradeAmountOption.Base
    ? market.value.quantityDecimals
    : market.value.priceDecimals
})

const isBuy = computed(
  () => spotFormValues.value[SpotTradeFormField.Side] === OrderSide.Buy
)

const { valueToString: baseBalanceToString, valueToFixed: baseBalanceToFixed } =
  useSharedBigNumberFormatter(
    computed(() => {
      const balance = userBalancesWithToken.value.find(
        (balance) => balance.token.denom === market.value.baseToken.denom
      )?.accountTotalBalance

      return new BigNumberInWei(balance || 0).toBase(
        market.value.baseToken.decimals
      )
    })
  )

const {
  valueToString: quoteBalanceToString,
  valueToFixed: quoteBalanceToFixed
} = useSharedBigNumberFormatter(
  computed(() => {
    const balance = userBalancesWithToken.value.find(
      (balance) => balance.token.denom === market.value.quoteToken.denom
    )?.accountTotalBalance

    return new BigNumberInWei(balance || 0).toBase(
      market.value.quoteToken.decimals
    )
  })
)

const { value: amountValue, errorMessage } = useStringField({
  name: SpotTradeFormField.Amount,

  dynamicRule: computed(() => {
    const maxAmount = isBuy.value
      ? quoteBalanceToFixed.value
      : baseBalanceToFixed.value

    const value = isBuy.value ? props.totalWithFee : props.quantity

    const insufficientBalanceRule = `insufficientBalanceCustom:${value.toFixed()},${maxAmount}`

    const minAmountRule = `minAmount:${props.minimumAmountInQuote.toFixed()}`

    const rules = [insufficientBalanceRule]

    if (typeValue.value === TradeAmountOption.Quote) {
      rules.push(minAmountRule)
    }

    return rules.join('|')
  })
})
</script>

<template>
  <div ref="el" class="space-y-2">
    <div class="flex justify-between items-end">
      <p class="field-label">{{ $t('trade.amount') }}</p>
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
  </div>
</template>
