<script setup lang="ts">
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { MarketTheme, MARKET_THEMES_SLUGS } from '@/app/data/market'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const isAscending = ref(false)
const sortBy = ref('')

const themes = computed(() =>
  Object.values(MarketTheme).reduce(
    (acc, theme) => {
      acc.push({
        theme,
        markets: props.markets.filter((market) =>
          MARKET_THEMES_SLUGS[theme].includes(market.market.slug)
        )
      })

      return acc
    },
    [] as { theme: MarketTheme; markets: UiMarketAndSummaryWithVolumeInUsd[] }[]
  )
)
</script>

<template>
  <div>
    <PartialsMarketsThemesTableHeader
      v-bind="{
        isAscending,
        sortBy
      }"
    />

    <div class="divide-y">
      <PartialsMarketsThemesTableRow
        v-for="theme in themes"
        :key="theme.theme"
        v-bind="{
          markets: theme.markets,
          theme: theme.theme
        }"
      />
    </div>
  </div>
</template>
