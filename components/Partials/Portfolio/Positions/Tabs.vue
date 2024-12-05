<script setup lang="ts">
import { PositionsFilterField } from '@/types'

const derivativeStore = useDerivativeStore()

const markets = computed(() => derivativeStore.markets)

const { value: marketValue } = useStringField({
  name: PositionsFilterField.Market
})

const { value: sideValue } = useStringField({
  name: PositionsFilterField.Side
})
</script>

<template>
  <div class="lg:h-header lg:flex lg:divide-x">
    <CommonSubaccountTabSelector />

    <CommonTabMarketSelector v-model="marketValue" v-bind="{ markets }" />
    <CommonTabSideFilter v-model="sideValue" />
    <CommonTabFormReset />

    <div class="flex-1 max-lg:hidden" />
  </div>
</template>
