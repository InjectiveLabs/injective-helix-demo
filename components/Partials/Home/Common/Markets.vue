<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  UiDerivativeMarketSummary,
  UiDerivativeMarketWithToken,
  UiSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { MarketFilterType, UiMarketAndSummary } from '@/types'
import { deprecatedMarkets, newMarketsSlug } from '@/app/data/market'

const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()

const props = defineProps({
  isHero: Boolean,

  filterType: {
    type: String as PropType<MarketFilterType>,
    default: MarketFilterType.Volume
  },

  limit: {
    type: Number,
    default: 3
  }
})

const status = reactive(new Status(StatusType.Idle))

const markets = computed(() => {
  return [
    ...derivativeStore.markets,
    ...spotStore.markets,
    ...exchangeStore.upcomingMarkets
  ]
})

const marketsSummary = computed(() => {
  return [
    ...derivativeStore.marketsSummary,
    ...spotStore.marketsSummary,
    ...exchangeStore.upcomingMarketsSummaries
  ]
})

const mappedMarkets = computed(() => {
  const result = markets.value.map(
    (market: UiSpotMarketWithToken | UiDerivativeMarketWithToken) => {
      return {
        market,
        summary: marketsSummary.value.find(
          (summary: UiSpotMarketSummary | UiDerivativeMarketSummary) =>
            summary.marketId === market.marketId
        )
      }
    }
  ) as UiMarketAndSummary[]

  return result.filter((m: UiMarketAndSummary) => m.summary !== undefined)
})

const filteredMarkets = computed(() => {
  const upcomingMarketsSlugs = exchangeStore.upcomingMarkets.map(
    (market: UiSpotMarketWithToken | UiDerivativeMarketWithToken) => market.slug
  )

  const deprecatedMarketsSlugs = deprecatedMarkets.map(
    (market: UiSpotMarketWithToken | UiDerivativeMarketWithToken) => market.slug
  )

  return mappedMarkets.value.filter(
    (m: UiMarketAndSummary) =>
      ![...upcomingMarketsSlugs, ...deprecatedMarketsSlugs].includes(
        m.market.slug
      )
  )
})

const marketsSortedByVolume = computed(() => {
  return filteredMarkets.value.sort(
    (a: UiMarketAndSummary, b: UiMarketAndSummary) => {
      const aVolume = a.summary.volume
      const bVolume = b.summary.volume

      return new BigNumberInBase(bVolume).minus(aVolume).toNumber()
    }
  )
})

const newMarketsList = computed(() => {
  return mappedMarkets.value
    .filter((summary: UiMarketAndSummary) => {
      return newMarketsSlug.includes(summary.market.slug.toLowerCase())
    })
    .sort(
      (a: UiMarketAndSummary, b: UiMarketAndSummary) =>
        newMarketsSlug.indexOf(a.market.slug) -
        newMarketsSlug.indexOf(b.market.slug)
    )
})

const filteredMarketsList = computed(() => {
  if (props.filterType === MarketFilterType.New) {
    return newMarketsList
  }

  if (props.filterType === MarketFilterType.Volume) {
    return marketsSortedByVolume
  }

  return filteredMarkets
})

const marketsList = computed(() => {
  // TODO: refactor so we can avoid value.value
  return filteredMarketsList.value.value.slice(0, props.limit)
})

const heroMarketsList = computed(() => {
  const [latestMarket, secondLatestMarket] = newMarketsList.value

  if (!latestMarket) {
    return marketsList.value
  }

  return secondLatestMarket
    ? [...marketsList.value, latestMarket, secondLatestMarket]
    : [...marketsList.value, latestMarket]
})

const categorizedMarketsList = computed(() => {
  if (props.isHero) {
    return heroMarketsList.value
  }

  return marketsList.value
})

useIntervalFn(() => appStore.pollMarkets(), 5 * 1000)
</script>

<template>
  <AppHocLoading :status="status" :show-loading="markets.length === 0">
    <div class="bg-white rounded-lg w-full self-center">
      <div class="overflow-auto">
        <PartialsHomeCommonMarketsHeader class="pt-6 pb-2" :is-hero="isHero" />

        <PartialsHomeCommonMarketsRow
          v-for="{ market, summary } in categorizedMarketsList"
          :key="`market-${market.marketId}`"
          :market="market"
          :summary="summary"
          :is-hero="isHero"
          class="border-b border-gray-300 last-of-type:border-b-0"
        />
      </div>
    </div>
  </AppHocLoading>
</template>

<style scoped>
*::-webkit-scrollbar-thumb {
  background-color: #d9dadc;
  border-radius: 20px;
  border: 2px solid #d9dadc;
}

*::-webkit-scrollbar-track {
  background: #fff;
}
</style>
