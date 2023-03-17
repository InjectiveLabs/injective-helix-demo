<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { newMarketsSlug } from '@/app/data/market'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const marketsWithLastTradedPriceGreaterThanZero = computed(() => {
  return props.markets.filter(({ summary }) => {
    const lastTradedPrice = new BigNumberInBase(
      summary?.lastPrice || summary?.price || '0'
    )

    return lastTradedPrice.gt('0')
  })
})

const newMarket = computed(() => {
  const firstExistingNewMarket = newMarketsSlug.find((newMarketSlug) => {
    return props.markets.find(({ market: { slug } }) => {
      return slug.toLowerCase() === newMarketSlug.toLowerCase()
    })
  })

  if (!firstExistingNewMarket) {
    return
  }

  return props.markets.find(({ market: { slug } }) => {
    return slug.toLowerCase() === firstExistingNewMarket.toLowerCase()
  })
})

const topVolume = computed(() => {
  if (props.markets.length === 0) {
    return undefined
  }

  const market = props.markets.reduce(
    (
      initialMarket: UiMarketAndSummaryWithVolumeInUsd,
      market: UiMarketAndSummaryWithVolumeInUsd
    ) => {
      if (initialMarket.volumeInUsd.eq(market.volumeInUsd)) {
        return sortMarketsAlphabetically(market, initialMarket)
      }

      return initialMarket.volumeInUsd.gt(market.volumeInUsd)
        ? initialMarket
        : market
    }
  )

  if (market.volumeInUsd.lte(0)) {
    return
  }

  return market
})

const topGainer = computed(() => {
  if (marketsWithLastTradedPriceGreaterThanZero.value.length === 0) {
    return undefined
  }

  return marketsWithLastTradedPriceGreaterThanZero.value.reduce(
    (
      initialMarket: UiMarketAndSummaryWithVolumeInUsd,
      market: UiMarketAndSummaryWithVolumeInUsd
    ) => {
      if (initialMarket.summary.change === market.summary.change) {
        return sortMarketsAlphabetically(market, initialMarket)
      }

      return initialMarket.summary.change > market.summary.change
        ? initialMarket
        : market
    }
  )
})

function sortMarketsAlphabetically(
  market: UiMarketAndSummaryWithVolumeInUsd,
  initialMarket: UiMarketAndSummaryWithVolumeInUsd
) {
  return initialMarket.market.slug.localeCompare(market.market.slug) > 0
    ? market
    : initialMarket
}
</script>

<template>
  <div class="w-full mx-auto xl:w-4/5 relative">
    <div class="bg-cover bg-center">
      <div class="mt-6">
        <h3 class="text-xl tracking-wider leading-6 font-bold hidden md:block">
          {{ $t('markets.title') }}
        </h3>

        <AppHorizontalScrollView class="mt-4">
          <PartialsMarketsCard
            v-if="newMarket && newMarket.summary"
            class="flex-0-full col-span-6 xl:col-span-4"
            data-cy="market-card-whats-new"
            :market="newMarket.market"
            :summary="newMarket.summary"
            :volume-in-usd="newMarket.volumeInUsd"
          >
            {{ $t('markets.whatsNew') }}
          </PartialsMarketsCard>

          <PartialsMarketsCard
            v-if="topVolume && topVolume.summary"
            class="flex-0-full col-span-6 xl:col-span-4"
            data-cy="market-card-top-volume"
            :market="topVolume.market"
            :summary="topVolume.summary"
            :volume-in-usd="topVolume.volumeInUsd"
          >
            {{ $t('markets.topVolume') }}
          </PartialsMarketsCard>

          <PartialsMarketsCard
            v-if="topGainer && topGainer.summary"
            class="flex-0-full col-span-6 xl:col-span-4"
            data-cy="market-card-top-gainer"
            :market="topGainer.market"
            :summary="topGainer.summary"
            :volume-in-usd="topGainer.volumeInUsd"
          >
            {{ $t('markets.topGainer') }}
          </PartialsMarketsCard>
        </AppHorizontalScrollView>
      </div>
    </div>
  </div>
</template>
