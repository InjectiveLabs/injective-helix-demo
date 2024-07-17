<script setup lang="ts">
import { SpotOrderHistoryFilterField } from '@/types'

const derivativeStore = useDerivativeStore()

const { value: marketValue } = useStringField({
  name: SpotOrderHistoryFilterField.Market
})

const { value: sideValue } = useStringField({
  name: SpotOrderHistoryFilterField.Side
})

const { value: typeValue } = useStringField({
  name: SpotOrderHistoryFilterField.Type
})

const emit = defineEmits<{
  'market:update': [market: string]
  'type:update': [type: string]
  'side:update': [side: string]
  'form:reset': []
}>()

function onMarketChange(market: string) {
  emit('market:update', market)
}

function onTypeChange(type: string) {
  emit('type:update', type)
}

function onSideChange(side: string) {
  emit('side:update', side)
}

function onFormReset() {
  emit('form:reset')
}
</script>

<template>
  <div class="lg:h-header lg:flex lg:divide-x">
    <CommonSubaccountTabSelector wrapper-class="w-full py-4" />

    <CommonTabMarketSelector
      v-model="marketValue"
      v-bind="{ markets: derivativeStore.markets }"
      @update:model-value="onMarketChange"
    />
    <CommonTabTypeFilter
      v-model="typeValue"
      is-derivative
      @update:model-value="onTypeChange"
    />
    <CommonTabSideFilter
      v-model="sideValue"
      is-spot
      @update:model-value="onSideChange"
    />
    <CommonTabFormReset @form:reset="onFormReset" />
  </div>
</template>
