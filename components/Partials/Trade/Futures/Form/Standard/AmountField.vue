<script setup lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiDerivativeMarket,
  TradeAmountOption,
  DerivativesTradeFormField,
  derivativeMarketKey
} from '@/types'

const props = defineProps({
  marginWithFee: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  }
})

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

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

const decimals = computed(() => {
  return typeValue.value === TradeAmountOption.Base
    ? market.value.quantityDecimals
    : market.value.priceDecimals
})

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

const { value: typeValue } = useStringField({
  name: DerivativesTradeFormField.AmountOption,
  initialValue: TradeAmountOption.Base
})

const { value: amountValue, errorMessage: amountErrorMessage } = useStringField(
  {
    name: DerivativesTradeFormField.Amount,
    initialValue: '',
    dynamicRule: computed(() => {
      const maxAmount = quoteBalanceToFixed.value
      const insufficientBalanceRule = `insufficientBalanceCustom:${props.marginWithFee.toFixed()},${maxAmount}`

      const rules = [insufficientBalanceRule]

      return rules.join('|')
    })
  }
)
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
