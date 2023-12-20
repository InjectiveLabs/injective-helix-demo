<script lang="ts" setup>
import { BaseDropdownOption } from '@injectivelabs/ui-shared'
import { spotGridMarkets } from '@/app/data/grid-strategy'
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

const options = computed<BaseDropdownOption[]>(() =>
  liquidityBotsMarkets.value.map((m) => ({
    display: `${m.baseToken.symbol}/${m.quoteToken.symbol}`,
    value: m.slug
  }))
)
</script>

<template>
  <div>
    <p class="mb-2 text-sm">{{ $t('liquidity.selectMarket') }}</p>

    <AppSelect
      v-model="value"
      v-bind="{
        options,
        wrapperClass: 'bg-black py-2 px-4 rounded-md'
      }"
      start-placement
    >
      <template #default="{ selected }">
        <PartialsLiquidityBotsSpotMarketOption v-bind="{ option: selected! }" />
      </template>

      <template #option="{ option }">
        <div>
          <PartialsLiquidityBotsSpotMarketOption v-bind="{ option }" />
        </div>
      </template>
    </AppSelect>
  </div>
</template>
