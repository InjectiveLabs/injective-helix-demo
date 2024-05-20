<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const derivativeStore = useDerivativeStore()

const { value: marketValue } = useStringField({
  name: SpotOpenOrdersFilterField.Market,
  rule: ''
})

const { value: sideValue } = useStringField({
  name: SpotOpenOrdersFilterField.Side,
  rule: ''
})
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r flex-1">
      <CommonTabMarketSelector
        v-bind="{ markets: derivativeStore.markets }"
        v-model="marketValue"
      />

      <CommonTabSideFilter v-model="sideValue" is-spot />
      <CommonTabFormReset />

      <div class="flex flex-1 items-center justify-end px-2">
        <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders />
      </div>
    </div>
  </div>
</template>
