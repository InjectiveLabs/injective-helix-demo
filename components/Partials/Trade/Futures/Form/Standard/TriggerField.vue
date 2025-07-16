<script setup lang="ts">
import {
  MarketKey,
  PerpetualMarketCyTags,
  DerivativesTradeFormField
} from '@/types'
import type { UiDerivativeMarket } from '@/types'

const { value: trigger, errorMessage } = useStringField({
  name: DerivativesTradeFormField.TriggerPrice,
  initialValue: ''
})

const market = inject(MarketKey) as Ref<UiDerivativeMarket>
</script>

<template>
  <div v-if="market" class="space-y-2">
    <p class="field-label">{{ $t('trade.triggerPrice') }}</p>

    <AppInputField
      v-model="trigger"
      placeholder="0.00"
      :data-cy="dataCyTag(PerpetualMarketCyTags.TriggerPriceInputField)"
    >
      <template #right>
        <span class="text-sm text-white">
          {{ market.quoteToken.symbol }}
        </span>
      </template>
    </AppInputField>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
