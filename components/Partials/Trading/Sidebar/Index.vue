<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { QUOTE_DENOMS_GECKO_IDS } from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const { $onError } = useNuxtApp()

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const marketsWithSummaryAndVolumeInUsd = computed(() =>
  [...derivativeStore.marketsWithSummary, ...spotStore.marketsWithSummary].map(
    ({ market, summary }) => {
      const quoteTokenUsdPrice = new BigNumberInBase(
        tokenStore.tokenUsdPrice(market.quoteToken.coinGeckoId)
      )

      return {
        market,
        summary,
        volumeInUsd: quoteTokenUsdPrice.multipliedBy(summary?.volume || '0')
      }
    }
  )
)

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

useIntervalFn(pollMarkets, 15 * 1000, { immediate: true })
</script>

<template>
  <CommonCard
    class="col-span-6 lg:col-span-3 4xl:col-span-3 h-screen-excluding-header-and-market-info pointer-events-auto overflow-y-auto"
    md
  >
    <AppHocLoading
      loader-class="relative"
      :show-loading="marketsWithSummaryAndVolumeInUsd.length === 0"
    >
      <PartialsTradingSidebarMarketsTable
        :market="market"
        :markets="marketsWithSummaryAndVolumeInUsd"
      />
    </AppHocLoading>
  </CommonCard>
</template>
