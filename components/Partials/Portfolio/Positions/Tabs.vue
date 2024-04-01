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
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r">
      <CommonTabMarketSelector v-model="marketValue" v-bind="{ markets }" />
      <CommonTabSideFilter v-model="sideValue" />
      <CommonTabFormReset />
    </div>
  </div>
</template>
