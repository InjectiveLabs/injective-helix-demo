<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'
import { spotGridMarkets } from '@/app/data/grid-strategy'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

const props = defineProps({
  isGrid: Boolean,

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const marketsWithSummaryAndVolumeInUsd = computed(() => {
  const markets = [
    ...derivativeStore.marketsWithSummary,
    ...spotStore.marketsWithSummary
  ].map(({ market, summary }) => {
    const quoteTokenUsdPrice = new BigNumberInBase(
      tokenStore.tokenUsdPrice(market.quoteToken)
    )

    return {
      market,
      summary,
      volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
    }
  })

  return props.isGrid
    ? markets.filter((m) =>
        spotGridMarkets.find((market) => market.slug === m.market.slug)
      )
    : markets
})

onMounted(() => {
  pollMarkets()
})

function pollMarkets() {
  Promise.all([
    tokenStore.fetchTokensUsdPriceMap(QUOTE_DENOMS_GECKO_IDS),
    derivativeStore.fetchMarketsSummary(),
    spotStore.fetchMarketsSummary()
  ]).catch($onError)
}

useIntervalFn(pollMarkets, 60 * 1000, { immediate: true })
</script>

<template>
  <CommonCard
    class="col-span-6 lg:col-span-3 4xl:col-span-3 h-screen-excluding-header-and-market-info pointer-events-auto overflow-y-auto"
    is-md
  >
    <AppHocLoading
      loader-class="relative"
      :is-loading="marketsWithSummaryAndVolumeInUsd.length === 0"
    >
      <PartialsTradingSidebarMarketsTable
        :market="market"
        :markets="marketsWithSummaryAndVolumeInUsd"
        :is-grid="isGrid"
      />
    </AppHocLoading>
  </CommonCard>
</template>
