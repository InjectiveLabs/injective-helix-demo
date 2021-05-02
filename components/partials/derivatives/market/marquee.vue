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
                value: singleMarket.price,
                decimals: singleMarket.maxPriceScaleDecimals,
                type: true
                  ? DerivativeOrderType.Long
                  : DerivativeOrderType.Short
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
import Vue from 'vue'
import { UiDerivativeMarket, DerivativeOrderType } from '~/types'

export default Vue.extend({
  data() {
    return {
      DerivativeOrderType
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    transformedMarkets(): UiDerivativeMarket[] {
      return this.filteredMarkets
    },

    filteredMarkets(): UiDerivativeMarket[] {
      const { market } = this

      if (!market) {
        return this.markets
      }

      return this.markets.filter((m) => m.ticker !== market.ticker)
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
