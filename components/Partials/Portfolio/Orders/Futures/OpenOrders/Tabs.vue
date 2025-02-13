<script setup lang="ts">
import { SpotOpenOrdersFilterField } from '@/types'

const appStore = useAppStore()
const accountStore = useAccountStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()

withDefaults(
  defineProps<{
    isTradingBots?: boolean
  }>(),
  {
    isTradingBots: false
  }
)

const { value: marketValue } = useStringField({
  name: SpotOpenOrdersFilterField.Market,
  rule: ''
})

const { value: sideValue } = useStringField({
  name: SpotOpenOrdersFilterField.Side,
  rule: ''
})

const hasActiveStrategyInSubaccount = computed(() =>
  gridStrategyStore.activeDerivativeStrategies.find(
    (strategy) => strategy.subaccountId === accountStore.subaccountId
  )
)
</script>

<template>
  <div class="lg:h-header lg:flex lg:divide-x">
    <CommonSubaccountTabSelector
      v-bind="{
        includeBotsSubaccounts:
          appStore.userState.preferences.showGridTradingSubaccounts,
        showLowBalance: true
      }"
    />

    <CommonTabMarketSelector
      v-bind="{ markets: derivativeStore.markets }"
      v-model="marketValue"
    />

    <CommonTabSideFilter v-model="sideValue" is-spot />

    <CommonTabFormReset />

    <div
      v-if="!isTradingBots || !hasActiveStrategyInSubaccount"
      class="hidden lg:flex flex-1 items-center justify-end px-2"
    >
      <PartialsPortfolioOrdersFuturesOpenOrdersCancelAllOrders />
    </div>

    <div class="flex-1 lg:hidden" />
  </div>
</template>
