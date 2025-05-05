<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const sharedDerivativeStore = useSharedDerivativeStore()

const emit = defineEmits<{
  'form:reset': []
  'market:update': [market: string]
}>()

const { value: marketValue } = useStringField({
  name: SpotOpenOrdersFilterField.Market,
  rule: ''
})

function onMarketChange(market: string) {
  emit('market:update', market)
}

function onFormReset() {
  emit('form:reset')
}
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector
      v-bind="{ includeBotsSubaccounts: true, showLowBalance: true }"
    />

    <div class="flex divide-x border-r">
      <CommonTabMarketSelector
        v-bind="{ markets: sharedDerivativeStore.marketsWithToken }"
        v-model="marketValue"
        @update:model-value="onMarketChange"
      />

      <CommonTabFormReset @form:reset="onFormReset" />
    </div>
  </div>
</template>
