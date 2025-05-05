<script setup lang="ts">
import { PositionsFilterField } from '@/types'

const appStore = useAppStore()
const sharedDerivativeStore = useSharedDerivativeStore()

const { value: marketValue } = useStringField({
  name: PositionsFilterField.Market
})

const { value: sideValue } = useStringField({
  name: PositionsFilterField.Side
})
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
      v-model="marketValue"
      v-bind="{ markets: sharedDerivativeStore.marketsWithToken }"
    />
    <CommonTabSideFilter v-model="sideValue" />
    <CommonTabFormReset />

    <div class="flex-1 max-lg:hidden" />
  </div>
</template>
