<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'

const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

const markets = computed(() => {
  return [
    ...derivativeStore.markets,
    ...spotStore.markets,
    ...exchangeStore.upcomingMarkets,
    ...exchangeStore.deprecatedMarkets
  ]
})

const marketsSummary = computed(() => {
  return [
    ...derivativeStore.marketsSummary,
    ...spotStore.marketsSummary,
    ...exchangeStore.upcomingMarketsSummaries,
    ...exchangeStore.deprecatedMarketsSummaries
  ]
})

const mappedMarkets = computed(() => {
  return markets.value
    .map((market) => {
      const summary = marketsSummary.value.find(
        (summary) => summary.marketId === market.marketId
      )

      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPriceMap[market.quoteToken.coinGeckoId] || 0
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
        summary !== undefined && volumeInUsd.isFinite()
    ) as UiMarketAndSummaryWithVolumeInUsd[]
})

onMounted(() => getQuoteTokenPrice())

function getQuoteTokenPrice() {
  Promise.all([
    tokenStore.getTokenUsdPriceMap(QUOTE_DENOMS_GECKO_IDS),
    appStore.pollMarkets()
  ]).catch($onError)
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)
</script>

<template>
  <AppHocLoading :show-loading="mappedMarkets.length === 0">
    <div>
      <PartialsMarketsOverview :markets="mappedMarkets" />
      <PartialsMarkets :markets="mappedMarkets" />
    </div>
  </AppHocLoading>
</template>
