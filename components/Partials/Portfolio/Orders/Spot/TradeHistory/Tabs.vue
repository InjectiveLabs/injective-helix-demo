<script setup lang="ts">
import { SpotOrderHistoryFilterField } from '@/types'

const appStore = useAppStore()
const sharedSpotStore = useSharedSpotStore()

const emit = defineEmits<{
  'form:reset': []
  'type:update': [type: string]
  'side:update': [side: string]
  'market:update': [market: string]
}>()

const { value: marketValue } = useStringField({
  name: SpotOrderHistoryFilterField.Market
})

const { value: sideValue } = useStringField({
  name: SpotOrderHistoryFilterField.Side
})

const { value: typeValue } = useStringField({
  name: SpotOrderHistoryFilterField.Type
})

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
  <div class="lg:h-header lg:divide-x lg:flex">
    <CommonSubaccountTabSelector
      v-bind="{
        includeBotsSubaccounts:
          appStore.userState.preferences.showGridTradingSubaccounts,
        showLowBalance: true
      }"
      wrapper-class="w-full py-4"
    />

    <CommonTabMarketSelector
      v-model="marketValue"
      v-bind="{ markets: sharedSpotStore.marketsWithToken }"
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

    <div class="flex-1 max-lg:hidden" />
  </div>
</template>
