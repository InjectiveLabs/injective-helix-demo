<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const { value: marketValue } = useStringField({
  name: SpotOpenOrdersFilterField.Market,
  rule: ''
})

const derivativeStore = useDerivativeStore()
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r">
      <CommonTabMarketSelector
        v-bind="{ markets: derivativeStore.markets }"
        v-model="marketValue"
      />

      <CommonTabFormReset />
    </div>
  </div>
</template>
