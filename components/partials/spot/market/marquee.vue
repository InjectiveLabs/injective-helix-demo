<template>
  <v-ui-card class="h-full">
    <infinite-slide-bar duration="30s" class="mt-3">
      <div class="flex justify-around items-center">
        <div
          v-for="singleMarket in transformedMarkets"
          :key="`maket-scroll-${singleMarket.ticker}`"
          class="px-4 cursor-pointer"
        >
          <div
            class="flex flex-wrap items-center"
            @click.stop.prevent="onClickMarket(singleMarket)"
          >
            <p class="leading-none">
              <v-ui-text sm class="font-semibold">{{
                singleMarket.ticker
              }}</v-ui-text>
            </p>
          </div>
          <v-ui-text sm class="flex items-center w-full">
            <!-- TODO: change of the price, change the type -->
            <v-ui-format-order-price
              v-bind="{
                value: singleMarket.priceToBn,
                decimals: singleMarket.priceDecimals,
                type: true ? SpotOrderType.Buy : SpotOrderType.Sell
              }"
              class="mr-1"
            />
          </v-ui-text>
        </div>
      </div>
    </infinite-slide-bar>
  </v-ui-card>
</template>

<script lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiSpotMarket, SpotOrderType, UiSpotMarketSummary } from '~/types'

interface UiSpotMarketWithBnPrice extends UiSpotMarket {
  priceToBn: BigNumberInBase
}

export default Vue.extend({
  data() {
    return {
      SpotOrderType
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    marketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    transformedMarkets(): UiSpotMarketWithBnPrice[] {
      const { filteredMarkets, marketsSummary } = this

      return [...filteredMarkets].map((market) => {
        const summary = marketsSummary.find(
          (summary) => summary.marketId === market.marketId
        )!

        return {
          ...market,
          priceToBn: new BigNumberInBase(summary.price)
        }
      })
    },

    filteredMarkets(): UiSpotMarket[] {
      const { market, marketsSummary } = this

      if (!market) {
        return this.markets
      }

      const marketSummaryExists = (m: UiSpotMarket) =>
        marketsSummary.findIndex((summary) => summary.marketId === m.marketId) >
        0

      return this.markets
        .filter((m) => m.ticker !== market.ticker)
        .filter(marketSummaryExists)
    }
  },

  methods: {
    onClickMarket({ slug, marketId }: UiSpotMarket) {
      this.$emit('selected')
      this.$router.push({
        name: 'spot-spot',
        params: {
          marketId,
          spot: slug
        }
      })
    }
  }
})
</script>
