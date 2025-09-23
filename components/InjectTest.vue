<script setup lang="ts">
import { OrderbookWorkerKey, UiSpotMarket } from '~/types'

const props = defineProps<{
  market: UiSpotMarket
}>()

const { quantity, notional, calculatedNotional } = useSpotDetails({
  isBuy: computed(() => true),
  market: computed(() => props.market),
  slippagePercentage: computed(() => '0.1')
})
</script>

<template>
  <div>
    <fieldset>
      <legend>Quantity</legend>
      <input v-model="quantity" type="number" />
      <label>Notional</label>
      <input v-model="notional" type="number" />
    </fieldset>

    <fieldset>
      <legend>Calculated Notional</legend>
      <p>{{ calculatedNotional }}</p>
    </fieldset>
  </div>
</template>
