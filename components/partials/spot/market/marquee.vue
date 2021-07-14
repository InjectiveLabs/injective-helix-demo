<template>
  <v-ui-card class="h-full">
    <infinite-slide-bar duration="30s" class="mt-2">
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
            <v-ui-format-order-price
              v-bind="{
                value: singleMarket.priceToBn,
                decimals: singleMarket.priceDecimals,
                type:
                  singleMarket.priceChange === Change.Increase
                    ? SpotOrderSide.Buy
                    : SpotOrderSide.Sell
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
import {
  UiSpotMarket,
  SpotOrderSide,
  UiSpotMarketSummary,
  Change
} from '~/types'

interface UiSpotMarketWithBnPrice extends UiSpotMarket {
  priceToBn: BigNumberInBase
  priceChange: Change
}

export default Vue.extend({
  data() {
    return {
      SpotOrderSide,
      Change
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
        const lastPrice = new BigNumberInBase(summary.lastPrice || 0)

        return {
          ...market,
          priceChange: lastPrice.gte(summary.price)
            ? Change.Increase
            : Change.Decrease,
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
