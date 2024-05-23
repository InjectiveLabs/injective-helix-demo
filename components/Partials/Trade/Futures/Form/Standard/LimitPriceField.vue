<script setup lang="ts">
import {
  UiDerivativeMarket,
  derivativeMarketKey,
  DerivativesTradeFormField
} from '@/types'

const market = inject(derivativeMarketKey) as Ref<UiDerivativeMarket>

const { lastTradedPrice } = useDerivativeLastPrice(computed(() => market.value))

const { value: limit, errorMessage } = useStringField({
  name: DerivativesTradeFormField.LimitPrice,
  initialValue: '',
  dynamicRule: computed(() => {
    const priceTooFarFromLastTradePrice = `priceTooFarFromLastTradePrice:${lastTradedPrice.value?.toFixed()}`

    return priceTooFarFromLastTradePrice
  })
})
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="field-label">{{ $t('trade.limitPrice') }}</p>

    <AppInputField v-model="limit" placeholder="0.00">
      <template #right>
        <span class="text-sm">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
