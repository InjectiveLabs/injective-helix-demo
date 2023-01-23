<script lang="ts" setup>
import { zeroDerivativeMarketSummary } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import {
  ETH_COIN_GECKO_ID,
  USDT_COIN_GECKO_ID,
  UST_COIN_GECKO_ID
} from '@/app/utils/constants'

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
    ...exchangeStore.deprecatedMarketsSummaries,
    zeroDerivativeMarketSummary(
      '0x7ba77b6c69c15270bd9235f11a0068f3080017116aa3c57e17c16f49ea13f57f'
    ) /* TODO remove */,
    zeroDerivativeMarketSummary(
      '0x59d526be33d5b00e856903810a5cc7676892f47954267805721614a403862470'
    ) /* TODO remove */
  ]
})

const mappedMarkets = computed(() => {
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

onMounted(() => getMarketSummariesAndQuoteTokenPrice())

function getMarketSummariesAndQuoteTokenPrice() {
  return Promise.all([
    tokenStore.getTokenUsdPriceMap([
      ETH_COIN_GECKO_ID,
      USDT_COIN_GECKO_ID,
      UST_COIN_GECKO_ID
    ]),
    appStore.pollMarkets()
  ]).catch($onError)
}

useIntervalFn(() => getMarketSummariesAndQuoteTokenPrice(), 10 * 1000)
</script>

<template>
  <AppHocLoading :show-loading="mappedMarkets.length === 0">
    <div>
      <PartialsMarketsOverview :markets="mappedMarkets" />
      <PartialsMarkets :markets="mappedMarkets" />
    </div>
  </AppHocLoading>
</template>
