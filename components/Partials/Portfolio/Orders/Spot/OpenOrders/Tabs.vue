<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const spotStore = useSpotStore()

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

    <div class="flex divide-x border-r">
      <CommonTabMarketSelector
        v-bind="{ markets: spotStore.markets }"
        v-model="marketValue"
      />

      <CommonTabSideFilter v-model="sideValue" is-spot />
      <CommonTabFormReset />
    </div>
  </div>
</template>
