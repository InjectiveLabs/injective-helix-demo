<script setup lang="ts">
import { SpotOrderHistoryFilterField } from '@/types'

const appStore = useAppStore()
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
  <div class="lg:h-header lg:flex">
    <CommonSubaccountTabSelector
      v-bind="{
        includeBotsSubaccounts:
          appStore.userState.preferences.showGridTradingSubaccounts
      }"
      wrapper-class="w-full"
    />

    <div class="grid lg:flex lg:divide-x border-r flex-1">
      <CommonTabMarketSelector
        v-model="marketValue"
        v-bind="{ markets: derivativeStore.markets }"
        @update:model-value="onMarketChange"
      />

      <CommonTabTypeFilter
        v-model="typeValue"
        is-trigger
        @update:model-value="onTypeChange"
      />

      <CommonTabSideFilter
        v-model="sideValue"
        is-spot
        @update:model-value="onSideChange"
      />
      <CommonTabFormReset @form:reset="onFormReset" />

      <div class="flex-1 flex items-center justify-end px-2 max-lg:py-2">
        <PartialsPortfolioOrdersFuturesAdvancedOrdersCancelAllAdvancedOrders
          class="max-lg:w-full"
        />
      </div>
    </div>
  </div>
</template>
