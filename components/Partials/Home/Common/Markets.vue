<script lang="ts" setup>
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  MarketFilterType,
  UiMarketAndSummary,
  UiMarketWithToken
} from '@/types'
import { deprecatedMarkets, newMarketsSlug } from '@/app/data/market'
import {
  MARKETS_HISTORY_CHART_ONE_HOUR,
  MARKETS_HISTORY_CHART_SEVEN_DAYS
} from '@/app/utils/constants'

const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  isHero: Boolean,

  limit: {
    type: Number,
    default: 3
  },

  filterType: {
    type: String as PropType<MarketFilterType>,
    default: MarketFilterType.Volume
  }
})

const status = reactive(new Status(StatusType.Loading))

const markets = computed(() => [
  ...derivativeStore.markets,
  ...spotStore.markets,
  ...exchangeStore.upcomingMarkets
])

const marketsWithSummary = computed<UiMarketAndSummary[]>(() => [
  ...derivativeStore.marketsWithSummary,
  ...exchangeStore.upcomingMarketsWithSummary,
  ...spotStore.marketsWithSummary
])

const newMarketsList = computed(() => {
  return marketsWithSummary.value
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
  const slugs = [...exchangeStore.upcomingMarkets, deprecatedMarkets].map(
    (market) => (market as UiMarketWithToken).slug
  )

  const filteredMarkets = marketsWithSummary.value.filter(
    (m: UiMarketAndSummary) => !slugs.includes(m.market.slug)
  )

  if (props.filterType === MarketFilterType.New) {
    return newMarketsList.value
  }

  if (props.filterType === MarketFilterType.Volume) {
    return filteredMarkets.sort(
      (a: UiMarketAndSummary, b: UiMarketAndSummary) => {
        const aVolume = a.summary?.volume || '0'
        const bVolume = b.summary?.volume || '0'

        return new BigNumberInBase(bVolume).minus(aVolume).toNumber()
      }
    )
  }

  return filteredMarkets
})

const marketsList = computed(() =>
  filteredMarketsList.value.slice(0, props.limit)
)

const heroMarketsList = computed(() => {
  const [latestMarket, secondLatestMarket] = newMarketsList.value

  if (!latestMarket) {
    return marketsList.value
  }

  return secondLatestMarket
    ? [...marketsList.value, latestMarket, secondLatestMarket]
    : [...marketsList.value, latestMarket]
})

const categorizedMarketsList = computed(() =>
  props.isHero ? heroMarketsList.value : marketsList.value
)

onMounted(() => {
  Promise.all([
    exchangeStore.fetchMarketsHistory({
      marketIds: categorizedMarketsList.value.map((m) => m.market.marketId),
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR,
      countback: MARKETS_HISTORY_CHART_SEVEN_DAYS
    })
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
})

useIntervalFn(() => appStore.pollMarkets(), 5 * 1000)
</script>

<template>
  <AppHocLoading :is-loading="markets.length === 0">
    <div class="bg-white rounded-lg w-full self-center">
      <div class="overflow-auto">
        <PartialsHomeCommonMarketsHeader class="pt-6 pb-2" :is-hero="isHero" />

        <PartialsHomeCommonMarketsRow
          v-for="{ market, summary } in categorizedMarketsList"
          :key="`market-${market.marketId}`"
          v-bind="{
            market,
            status,
            summary,
            isHero: props.isHero
          }"
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
