<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'

const appStore = useAppStore()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const exchangeStore = useExchangeStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [
    ...derivativeStore.marketsWithSummary,
    ...exchangeStore.deprecatedMarketsWithSummary,
    ...exchangeStore.upcomingMarketsWithSummary,
    ...spotStore.marketsWithSummary
  ].map(({ market, summary }) => {
    const quoteTokenUsdPrice = new BigNumberInBase(
      tokenStore.tokenUsdPriceMap[market.quoteToken.coinGeckoId] || 0
    )

    return {
      market,
      summary,
      volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
    }
  })
)

const marketSummariesLoaded = computed(() => {
  return (
    spotStore.marketsWithSummary.length > 0 &&
    derivativeStore.marketsWithSummary.length > 0
  )
})

onMounted(() => getQuoteTokenPrice())

function getQuoteTokenPrice() {
  Promise.all([
    tokenStore.fetchTokenUsdPriceMap(QUOTE_DENOMS_GECKO_IDS),
    appStore.pollMarkets()
  ]).catch($onError)
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)
</script>

<template>
  <AppHocLoading :show-loading="!marketSummariesLoaded" class="h-full">
    <div class="container">
      <PartialsMarketsOverview :markets="marketsWithSummaryAndVolumeInUsd" />
      <PartialsMarkets :markets="marketsWithSummaryAndVolumeInUsd" />
    </div>
  </AppHocLoading>
</template>
