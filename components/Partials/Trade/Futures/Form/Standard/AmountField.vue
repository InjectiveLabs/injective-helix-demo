<script setup lang="ts">
import {
  UiDerivativeMarket,
  TradeAmountOption,
  DerivativesTradeFormField,
  derivativeMarketKey
} from '@/types'

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const { value: typeValue } = useStringField({
  name: DerivativesTradeFormField.AmountOption,
  initialValue: TradeAmountOption.Base
})

const { value: amountValue } = useStringField({
  name: DerivativesTradeFormField.Amount,
  initialValue: ''
})

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

const decimals = computed(() => {
  return typeValue.value === TradeAmountOption.Base
    ? market.value.quantityDecimals
    : market.value.priceDecimals
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
    </AppInputField>

    <div v-if="false" class="error-message">Error</div>
  </div>
</template>
