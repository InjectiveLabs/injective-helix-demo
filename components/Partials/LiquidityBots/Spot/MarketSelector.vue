<script lang="ts" setup>
import { SharedDropdownOption } from '@shared/types'
import spotGridMarkets from '@/app/data/spotGridMarkets.json'

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

const options = computed<SharedDropdownOption[]>(() =>
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
        wrapperClass: 'bg-black py-2 px-4 rounded-md',
        contentClass: 'h-[320px] overflow-y-auto w-[300px]'
      }"
      start-placement
    >
      <template #default="{ selected }">
        <PartialsLiquidityBotsSpotMarketOption
          v-if="selected"
          v-bind="{ option: selected }"
        />
      </template>

      <template #option="{ option }">
        <PartialsLiquidityBotsSpotMarketOption v-bind="{ option }" />
      </template>
    </AppSelect>
  </div>
</template>
