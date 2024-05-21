<script setup lang="ts">
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { newMarketsSlug } from '@/app/data/market'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const hotMarkets = computed(() =>
  props.markets
    .filter(({ market }) =>
      ['inj-usdt', 'btc-usdt-perp', 'weth-usdt'].includes(market.slug)
    )
    .slice(0, 3)
)

const newMarkets = computed(
  () =>
    newMarketsSlug
      .map((slug) =>
        props.markets.find((market) => market.market.slug === slug)
      )
      .filter((market) => market)
      .slice(0, 3) as UiMarketAndSummaryWithVolumeInUsd[]
)

const highestGainers = computed(() =>
  [...props.markets]
    .sort((a, b) => Number(b.summary.change) - Number(a.summary.change))
    .slice(0, 3)
)

const categories = computed(() => [
  { title: 'markets.hotMarkets', markets: hotMarkets.value },
  { title: 'markets.newMarkets', markets: newMarkets.value },
  { title: 'markets.topGainers', markets: highestGainers.value }
])
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div
      v-for="category in categories"
      :key="category.title"
      class="border border-brand-800 bg-brand-875/50 p-4 rounded-lg space-y-2"
    >
      <h3 class="mb-4 text-gray-300 font-semibold p-2">
        {{ $t(category.title) }}
      </h3>

      <PartialsMarketsNewMarketsRow
        v-for="market in category.markets"
        v-bind="{ market }"
        :key="market.market.marketId"
      />
    </div>
  </div>
</template>
