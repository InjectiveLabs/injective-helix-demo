<script setup lang="ts">
import { SpotOrderHistoryFilterField } from '@/types'

const spotStore = useSpotStore()

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
  <div class="h-header flex">
    <CommonSubaccountTabSelector />
    <div class="flex divide-x border-r">
      <CommonTabMarketSelector
        v-model="marketValue"
        v-bind="{ markets: spotStore.markets }"
        @update:model-value="onMarketChange"
      />
      <CommonTabTypeFilter
        v-model="typeValue"
        @update:model-value="onTypeChange"
      />
      <CommonTabSideFilter
        v-model="sideValue"
        is-spot
        @update:model-value="onSideChange"
      />
      <CommonTabFormReset @form:reset="onFormReset" />
    </div>
  </div>
</template>
