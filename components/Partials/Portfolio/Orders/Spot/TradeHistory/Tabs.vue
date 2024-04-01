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
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />
    <div class="flex divide-x border-r">
      <CommonTabMarketSelector
        v-model="marketValue"
        v-bind="{ markets: spotStore.markets }"
      />
      <CommonTabTypeFilter v-model="typeValue" />
      <CommonTabSideFilter v-model="sideValue" is-spot />
      <CommonTabFormReset />
    </div>
  </div>
</template>
