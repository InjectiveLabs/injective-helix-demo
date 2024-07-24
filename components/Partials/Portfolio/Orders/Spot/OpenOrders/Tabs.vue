<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const appStore = useAppStore()
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
  <div class="lg:h-header lg:divide-x lg:flex">
    <CommonSubaccountTabSelector
      :include-bots-subaccounts="
        appStore.userState.preferences.showGridTradingSubaccounts
      "
      wrapper-class="w-full py-4"
    />

    <CommonTabMarketSelector
      v-bind="{ markets: spotStore.markets }"
      v-model="marketValue"
    />

    <CommonTabSideFilter v-model="sideValue" is-spot />
    <CommonTabFormReset />

    <div class="hidden lg:flex justify-end items-center px-2 flex-1">
      <PartialsPortfolioOrdersSpotOpenOrdersCancelAllOrders />
    </div>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
