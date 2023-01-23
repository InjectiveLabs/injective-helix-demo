<script lang="ts" setup>
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

const spotStore = useSpotStore()

const market = ref<UiSpotMarketWithToken | undefined>(undefined)

function onLoad(pageMarket: UiMarketWithToken) {
  spotStore.initMarketStreams(pageMarket.marketId)

  market.value = pageMarket as UiSpotMarketWithToken
}
</script>

<template>
  <PartialsTradingLayout is-spot @loaded="onLoad">
    <template #trading-form>
      <PartialsTradingSpotTradingForm v-if="market" :market="market" />
    </template>

    <template #orders>
      <PartialsTradingSpotOrders v-if="market" :market="market" />
    </template>
  </PartialsTradingLayout>
</template>
