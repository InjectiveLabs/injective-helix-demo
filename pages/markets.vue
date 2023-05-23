<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'

const appStore = useAppStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [
    ...spotStore.marketsWithSummary,
    ...derivativeStore.marketsWithSummary,
    ...exchangeStore.upcomingMarketsWithSummary,
    ...exchangeStore.deprecatedMarketsWithSummary
  ].map(({ market, summary }) => {
    const quoteTokenUsdPrice = new BigNumberInBase(
      tokenStore.tokenUsdPrice(market.quoteToken.coinGeckoId)
    )

    return {
      market,
      summary,
      volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
    }
  })
)

onMounted(() => getQuoteTokenPrice())

const marketsWithSummariesLoaded = computed(
  () =>
    spotStore.marketsWithSummary.some(({ summary }) => summary) &&
    derivativeStore.marketsWithSummary.some(({ summary }) => summary)
)

function getQuoteTokenPrice() {
  Promise.all([
    appStore.pollMarkets(),
    tokenStore.fetchTokensUsdPriceMap(QUOTE_DENOMS_GECKO_IDS)
  ]).catch($onError)
}

useIntervalFn(() => getQuoteTokenPrice(), 10 * 1000)
</script>

<template>
  <AppHocLoading :show-loading="!marketsWithSummariesLoaded" class="h-full">
    <div class="container">
      <PartialsMarketsOverview :markets="marketsWithSummaryAndVolumeInUsd" />
      <PartialsMarkets :markets="marketsWithSummaryAndVolumeInUsd" />
    </div>
  </AppHocLoading>
</template>
