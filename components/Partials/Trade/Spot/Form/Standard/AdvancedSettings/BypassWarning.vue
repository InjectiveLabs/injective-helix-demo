<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotMarketCyTags, SpotTradeFormField } from '@/types'

const { value: bypassPriceWarningValue } = useBooleanField({
  rule: '',
  name: SpotTradeFormField.BypassPriceWarning
})
</script>

<template>
  <div>
    <AppCheckbox2
      v-model="bypassPriceWarningValue"
      class="w-full text-white"
      :data-cy="dataCyTag(SpotMarketCyTags.AdvancedSettingsBypassWarning)"
    >
      {{ $t('trade.bypassPriceWarning') }}
    </AppCheckbox2>
  </div>
</template>
