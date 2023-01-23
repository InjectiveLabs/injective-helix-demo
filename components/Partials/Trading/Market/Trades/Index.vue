<script lang="ts" setup>
import { PropType } from 'vue'
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken } from '@/types'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot

const trades = computed(() =>
  isSpot ? spotStore.trades : derivativeStore.trades
)
</script>

<template>
  <div class="flex flex-col flex-wrap">
    <PartialsTradingMarketTradesHeader :market="market" />

    <div class="flex-1 w-full overflow-y-auto overflow-x-hidden rounded-b-lg">
      <ul class="list-trades w-full">
        <PartialsTradingMarketTradesItem
          v-for="(trade, index) in trades"
          :key="`trade-${index}`"
          :market="market"
          :trade="trade"
        />
      </ul>
    </div>
  </div>
</template>
