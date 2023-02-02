<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

const markets = computed(() => {
  return [...derivativeStore.markets, ...spotStore.markets]
})

const marketsSummary = computed(() => {
  return [...derivativeStore.marketsSummary, ...spotStore.marketsSummary]
})

const mappedMarkets = computed<UiMarketAndSummaryWithVolumeInUsd[]>(() => {
  return markets.value
    .map((market) => {
      const summary = marketsSummary.value.find(
        (summary) => summary.marketId === market.marketId
      )

      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPriceMap[market.quoteToken.coinGeckoId]
      )

      const volumeInUsd = quoteTokenUsdPrice.multipliedBy(
        summary?.volume || '0'
      )

      return {
        market,
        volumeInUsd,
        summary
      }
    })
    .filter(
      ({ summary, volumeInUsd }) =>
        summary !== undefined && !volumeInUsd.isNaN() && volumeInUsd.isFinite()
    ) as UiMarketAndSummaryWithVolumeInUsd[]
})

onMounted(() => {
  pollMarkets()
})

function pollMarkets() {
  Promise.all([
    tokenStore.getTokenUsdPriceMap(QUOTE_DENOMS_GECKO_IDS),
    derivativeStore.fetchMarketsSummary(),
    spotStore.fetchMarketsSummary()
  ]).catch($onError)
}

useIntervalFn(pollMarkets, 10 * 1000, { immediate: true })
</script>

<template>
  <CommonCard
    class="col-span-6 lg:col-span-3 4xl:col-span-3 h-screen-excluding-header-and-market-info pointer-events-auto overflow-y-auto"
    md
  >
    <AppHocLoading
      loader-class="relative"
      :show-loading="mappedMarkets.length === 0"
    >
      <PartialsTradingSidebarMarketsTable
        v-bind="$attrs"
        :markets="mappedMarkets"
      />
    </AppHocLoading>
  </CommonCard>
</template>
