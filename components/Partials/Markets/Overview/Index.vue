<script setup lang="ts">
import { newMarketsMarketIds } from '@/app/data/market'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '@/app/utils/constants'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const exchangeStore = useExchangeStore()

const HOT_MARKETS_SLUGS = ['inj-usdt', 'btc-usdt-perp', 'weth-usdt', 'sol-usdt']

const props = withDefaults(
  defineProps<{
    markets: UiMarketAndSummaryWithVolumeInUsd[]
  }>(),
  {
    markets: () => []
  }
)

const hotMarkets = computed(() =>
  props.markets.filter(({ market }) => HOT_MARKETS_SLUGS.includes(market.slug))
)

const newMarkets = computed(
  () =>
    newMarketsMarketIds
      .map((marketId) =>
        props.markets.find((market) => market.market.marketId === marketId)
      )
      .filter((market) => market)
      .slice(0, 4) as UiMarketAndSummaryWithVolumeInUsd[]
)

const highestGainers = computed(() =>
  [...props.markets]
    .filter((market) => market.market.isVerified)
    .sort((a, b) => Number(b.summary.change) - Number(a.summary.change))
    .slice(0, 4)
)

const categories = computed(() => [
  { title: 'markets.newMarkets', markets: newMarkets.value },
  { title: 'markets.topGainers', markets: highestGainers.value }
])

onMounted(() => {
  Promise.all([
    exchangeStore.fetchMarketHistory({
      marketIds: hotMarkets.value.map((market) => market.market.marketId),
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR,
      countback: 30 * 24
    })
  ])
})
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-5 lg:gap-8">
    <div class="col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PartialsMarketsOverviewMarketCard
        v-for="market in hotMarkets"
        v-bind="{ market }"
        :key="market.market.marketId"
      />
    </div>

    <div class="col-span-3 grid grid-cols-1 mt-8 lg:grid-cols-2 gap-4 lg:mt-0">
      <div
        v-for="category in categories"
        :key="category.title"
        class="border border-brand-800 p-4 rounded-lg space-y-1"
      >
        <h3 class="mb-4 text-coolGray-200 text-sm px-2 font-semibold">
          {{ $t(category.title) }}
        </h3>

        <PartialsMarketsOverviewMarketRow
          v-for="market in category.markets"
          v-bind="{ market }"
          :key="market.market.marketId"
        />
      </div>
    </div>
  </div>
</template>
