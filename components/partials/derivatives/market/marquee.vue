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
                    ? DerivativeOrderSide.Buy
                    : DerivativeOrderSide.Sell
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
  UiDerivativeMarket,
  DerivativeOrderSide,
  Change,
  UiDerivativeMarketSummary
} from '~/types'

interface UiDerivativeMarketWithBnPrice extends UiDerivativeMarket {
  priceToBn: BigNumberInBase
  priceChange: Change
}

export default Vue.extend({
  data() {
    return {
      Change,
      DerivativeOrderSide
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },
    marketsSummary(): UiDerivativeMarketSummary[] {
      return this.$accessor.derivatives.marketsSummary
    },

    transformedMarkets(): UiDerivativeMarketWithBnPrice[] {
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

    filteredMarkets(): UiDerivativeMarket[] {
      const { market, marketsSummary } = this

      if (!market) {
        return this.markets
      }

      const marketSummaryExists = (m: UiDerivativeMarket) =>
        marketsSummary.findIndex((summary) => summary.marketId === m.marketId) >
        0

      return this.markets
        .filter((m) => m.ticker !== market.ticker)
        .filter(marketSummaryExists)
    }
  },

  methods: {
    onClickMarket({ slug, marketId }: UiDerivativeMarket) {
      this.$router.push({
        name: 'derivatives-derivative',
        params: {
          marketId,
          derivatives: slug
        }
      })
    }
  }
})
</script>
