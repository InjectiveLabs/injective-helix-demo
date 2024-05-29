<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const emit = defineEmits<{
  'market:update': [market: string]
  'form:reset': []
}>()

const { value: marketValue } = useStringField({
  name: SpotOpenOrdersFilterField.Market,
  rule: ''
})

const derivativeStore = useDerivativeStore()

function onMarketChange(market: string) {
  emit('market:update', market)
}

function onFormReset() {
  emit('form:reset')
}
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r">
      <CommonTabMarketSelector
        v-bind="{ markets: derivativeStore.markets }"
        v-model="marketValue"
        @update:model-value="onMarketChange"
      />

      <CommonTabFormReset @form:reset="onFormReset" />
    </div>
  </div>
</template>
