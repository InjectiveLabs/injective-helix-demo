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
  <div class="h-header divide-x flex">
    <CommonSubaccountTabSelector
      wrapper-class="w-full py-4 max-lg:border-b max-lg:border-r"
    />

    <CommonTabMarketSelector
      v-bind="{ markets: spotStore.markets }"
      v-model="marketValue"
      wrapper-class="border-b"
    />

    <CommonTabSideFilter
      v-model="sideValue"
      wrapper-class="border-r [&>*]:py-4"
      is-spot
    />
    <CommonTabFormReset />

    <div class="flex justify-end items-center px-2 flex-1">
      <PartialsPortfolioOrdersSpotOpenOrdersCancelAllOrders />
    </div>
  </div>
</template>
