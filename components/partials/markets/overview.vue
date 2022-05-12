<template>
  <div
    :style="{ backgroundImage: `url('/svg/bg-blue-glow.svg')` }"
    class="py-6 md:pt-12 md:pb-16 bg-cover bg-center"
  >
    <div class="container xl:max-w-6xl mx-auto">
      <h3 class="text-xl tracking-wider leading-6 font-bold hidden md:block">
        {{ $t('markets.title') }}
      </h3>

      <div
        v-if="markets.length > 0"
        v-touch:swipe.left="handleSwipeRight"
        v-touch:swipe.right="handleSwipeLeft"
        class="md:hidden"
      >
        <transition mode="out-in" :name="animation">
          <v-market-card
            v-if="newMarket && activeIndex === 1"
            key="market-card-1"
            :market="newMarket.market"
            :summary="newMarket.summary"
            :volume-in-usd="newMarket.volumeInUsd"
          >
            {{ $t('markets.whatsNew') }}
          </v-market-card>

          <v-market-card
            v-if="activeIndex === 2"
            key="market-card-2"
            :market="topVolume.market"
            :summary="topVolume.summary"
            :volume-in-usd="topVolume.volumeInUsd"
          >
            {{ $t('markets.topVolume') }}
          </v-market-card>

          <v-market-card
            v-if="activeIndex === 3"
            key="market-card-3"
            :market="topGainer.market"
            :summary="topGainer.summary"
            :volume-in-usd="topGainer.volumeInUsd"
          >
            {{ $t('markets.topGainer') }}
          </v-market-card>
        </transition>
      </div>

      <div
        v-if="markets.length > 0"
        class="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-6 mt-6"
      >
        <v-market-card
          v-if="newMarket"
          :market="newMarket.market"
          :summary="newMarket.summary"
          :volume-in-usd="newMarket.volumeInUsd"
        >
          {{ $t('markets.whatsNew') }}
        </v-market-card>

        <v-market-card
          :market="topVolume.market"
          :summary="topVolume.summary"
          :volume-in-usd="topVolume.volumeInUsd"
        >
          {{ $t('markets.topVolume') }}
        </v-market-card>

        <v-market-card
          :market="topGainer.market"
          :summary="topGainer.summary"
          :volume-in-usd="topGainer.volumeInUsd"
        >
          {{ $t('markets.topGainer') }}
        </v-market-card>
      </div>

      <div class="flex justify-center gap-2 mt-6 md:hidden">
        <v-market-dot
          v-for="dot in dotCount"
          :key="`market-dot-${dot}`"
          :index="dot"
          :active="activeIndex === dot"
          @click="handleDotClick"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import VMarketCard from '~/components/partials/markets/market-card.vue'
import VMarketDot from '~/components/partials/markets/market-dot.vue'
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
    VMarketCard,
    VMarketDot
  },

  props: {
    markets: {
      type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
      required: true
    }
  },

  data() {
    return {
      activeIndex: 1,
      dotCount: 3,
      animation: 'fade-right'
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

    topVolume(): UiMarketAndSummaryWithVolumeInUsd {
      const { markets } = this

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

    topGainer(): UiMarketAndSummaryWithVolumeInUsd {
      const { marketsWithLastTradedPriceGreaterThanZero } = this

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
  },

  mounted() {},

  methods: {
    handleDotClick(index: number) {
      this.animation = index > this.activeIndex ? 'fade-left' : 'fade-right'
      this.activeIndex = index
    },

    handleSwipeRight() {
      const { activeIndex, dotCount } = this

      if (activeIndex === dotCount) {
        this.activeIndex = 1
        this.animation = 'fade-left'
      } else {
        this.animation = 'fade-right'
        this.activeIndex = this.activeIndex + 1
      }
    },

    handleSwipeLeft() {
      const { activeIndex, dotCount } = this

      if (activeIndex === 1) {
        this.animation = 'fade-right'
        this.activeIndex = dotCount
      } else {
        this.animation = 'fade-left'
        this.activeIndex = this.activeIndex - 1
      }
    }
  }
})
</script>
