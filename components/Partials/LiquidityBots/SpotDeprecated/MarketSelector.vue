<script lang="ts" setup>
import { spotGridMarkets } from '@/app/json'

const gridStrategyStore = useGridStrategyStore()

const spotStore = useSpotStore()

const marketSlugQuery = useQueryRef('market', 'tia-usdt')

const liquidityBotsMarkets = computed(() =>
  spotStore.markets.filter((market) =>
    spotGridMarkets.find((m) => m.slug === market.slug)
  )
)

const value = computed({
  get: () => gridStrategyStore.spotMarket?.slug,
  set: (marketSlug) => {
    marketSlugQuery.value = marketSlug as string

    gridStrategyStore.$patch({
      spotMarket: spotStore.markets.find((m) => m.slug === marketSlug)
    })
  }
})

const options = computed(() =>
  liquidityBotsMarkets.value.map((m) => ({
    label: `${m.baseToken.symbol}/${m.quoteToken.symbol}`,
    id: m.slug
  }))
)
</script>

<template>
  <div>
    <p class="mb-2 text-sm">{{ $t('liquidity.selectMarket') }}</p>

    <USelectMenu v-model="value" :options="options" value-attribute="id" />
  </div>
</template>
