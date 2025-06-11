<script setup lang="ts">
import { DerivativesTradeFormField, PerpetualMarketCyTags } from '@/types'

const { value: bypassPriceWarningValue } = useBooleanField({
  name: DerivativesTradeFormField.BypassPriceWarning,
  rule: ''
})
</script>

<template>
  <div>
    <AppCheckbox 
      v-model="bypassPriceWarningValue"
      class="w-full text-white"
      :data-cy="dataCyTag(PerpetualMarketCyTags.AdvancedSettingsByPassPriceWarningCheckbox)"
    >
      {{ $t('trade.bypassPriceWarning') }}
    </AppCheckbox>
  </div>
</template>
