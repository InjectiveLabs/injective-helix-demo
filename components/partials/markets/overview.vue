<template>
  <div
    :style="{ backgroundImage: `url('/svg/bg-blue-glow.svg')` }"
    class="py-6 md:pt-12 md:pb-16 bg-cover bg-center"
  >
    <div class="container xl:max-w-6xl mx-auto">
      <h3 class="text-xl tracking-wider leading-6 font-bold hidden md:block">
        {{ $t('markets.title') }}
      </h3>

      <HorizontalScrollView class="mt-6">
        <MarketCard
          v-if="newMarket"
          class="flex-0-full col-span-6 xl:col-span-4"
          data-cy="market-card-whats-new"
          :market="newMarket.market"
          :summary="newMarket.summary"
          :volume-in-usd="newMarket.volumeInUsd"
        >
          {{ $t('markets.whatsNew') }}
        </MarketCard>

        <MarketCard
          v-if="topVolume"
          class="flex-0-full col-span-6 xl:col-span-4"
          data-cy="market-card-top-volume"
          :market="topVolume.market"
          :summary="topVolume.summary"
          :volume-in-usd="topVolume.volumeInUsd"
        >
          {{ $t('markets.topVolume') }}
        </MarketCard>

        <MarketCard
          v-if="topGainer"
          class="flex-0-full col-span-6 xl:col-span-4"
          data-cy="market-card-top-gainer"
          :market="topGainer.market"
          :summary="topGainer.summary"
          :volume-in-usd="topGainer.volumeInUsd"
        >
          {{ $t('markets.topGainer') }}
        </MarketCard>
      </HorizontalScrollView>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import MarketCard from '~/components/partials/markets/market-card.vue'
import HorizontalScrollView from '~/components/elements/horizontal-scroll-view.vue'
import { newMarketsSlug } from '~/app/data/market'
import { UiMarketAndSummaryWithVolumeInUsd } from '~/types'

const sortMarketsAlphabetically = (
  market: UiMarketAndSummaryWithVolumeInUsd,
  initialMarket: UiMarketAndSummaryWithVolumeInUsd
): UiMarketAndSummaryWithVolumeInUsd => {
  return initialMarket.market.slug.localeCompare(market.market.slug) > 0
    ? market
    : initialMarket
}

export default Vue.extend({
  components: {
    HorizontalScrollView,
    MarketCard
  },

  props: {
    markets: {
      type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
      required: true
    }
  },

  computed: {
    marketsWithLastTradedPriceGreaterThanZero(): UiMarketAndSummaryWithVolumeInUsd[] {
      const { markets } = this

      return markets.filter(({ summary: { lastPrice, price } }) => {
        const lastTradedPrice = new BigNumberInBase(lastPrice || price)

        return lastTradedPrice.gt('0')
      })
    },

    newMarket(): UiMarketAndSummaryWithVolumeInUsd | undefined {
      const { markets } = this

      const firstExistingNewMarket = newMarketsSlug.find((newMarketSlug) => {
        return markets.find(({ market: { slug } }) => {
          return slug.toLowerCase() === newMarketSlug.toLowerCase()
        })
      })

      if (!firstExistingNewMarket) {
        return
      }

      return markets.find(({ market: { slug } }) => {
        return slug.toLowerCase() === firstExistingNewMarket.toLowerCase()
      })
    },

    topVolume(): UiMarketAndSummaryWithVolumeInUsd | undefined {
      const { markets } = this

      if (markets.length === 0) {
        return undefined
      }

      return markets.reduce(
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
    },

    topGainer(): UiMarketAndSummaryWithVolumeInUsd | undefined {
      const { marketsWithLastTradedPriceGreaterThanZero } = this

      if (marketsWithLastTradedPriceGreaterThanZero.length === 0) {
        return undefined
      }

      return marketsWithLastTradedPriceGreaterThanZero.reduce(
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
    }
  }
})
</script>
