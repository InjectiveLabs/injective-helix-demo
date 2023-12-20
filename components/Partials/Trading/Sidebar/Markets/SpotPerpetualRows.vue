<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { UiMarketWithToken, UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = defineProps({
  isGrid: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const expiryFuturesMarkets = computed(() =>
  props.markets.filter(({ market }) => market.subType === MarketType.Futures)
)

const spotAndPerpetualMarkets = computed(() =>
  props.markets.filter(({ market }) => market.subType !== MarketType.Futures)
)
</script>

<template>
  <div>
    <div v-if="expiryFuturesMarkets.length > 0">
      <div class="text-sm text-gray-450 leading-4 ml-3 mb-1">
        {{ $t('markets.preLaunchFutures') }}
      </div>
      <div class="mb-4">
        <PartialsTradingSidebarMarketsRow
          v-for="(marketSummary, index) in expiryFuturesMarkets"
          v-bind="{
            ...$attrs,
            market: marketSummary.market,
            summary: marketSummary.summary,
            volumeInUsd: marketSummary.volumeInUsd,
            isCurrentMarket: market.marketId === marketSummary.market.marketId,
            isGrid
          }"
          :key="`market-row-${index}-${marketSummary.market.marketId}`"
        />
      </div>
    </div>

    <div
      v-if="expiryFuturesMarkets.length > 0"
      class="text-sm text-gray-450 leading-4 ml-3 mb-1"
    >
      {{ $t('markets.perpetuals') }}
    </div>

    <PartialsTradingSidebarMarketsRow
      v-for="(marketSummary, index) in spotAndPerpetualMarkets"
      v-bind="{
        ...$attrs,
        market: marketSummary.market,
        summary: marketSummary.summary,
        volumeInUsd: marketSummary.volumeInUsd,
        isCurrentMarket: market.marketId === marketSummary.market.marketId,
        isGrid
      }"
      :key="`market-row-${index}-${marketSummary.market.marketId}`"
    />
  </div>
</template>
