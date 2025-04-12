<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const appStore = useAppStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const gridStrategyStore = useGridStrategyStore()

const { value: marketValue } = useStringField({
  name: SpotOpenOrdersFilterField.Market,
  rule: ''
})

const { value: sideValue } = useStringField({
  name: SpotOpenOrdersFilterField.Side,
  rule: ''
})

const hasActiveStrategyInSubaccount = computed(() =>
  gridStrategyStore.activeSpotStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)
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
      v-bind="{ markets: spotStore.markets }"
      v-model="marketValue"
    />

    <CommonTabSideFilter v-model="sideValue" is-spot />
    <CommonTabFormReset />

    <div
      v-if="!hasActiveStrategyInSubaccount"
      class="hidden lg:flex justify-end items-center px-2 flex-1"
    >
      <PartialsPortfolioOrdersSpotOpenOrdersCancelAllOrders />
    </div>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
