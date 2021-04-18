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
import Vue from 'vue'
import { UiSpotMarket, SpotOrderType } from '~/types'

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

    transformedMarkets(): UiSpotMarket[] {
      return this.filteredMarkets
    },

    filteredMarkets(): UiSpotMarket[] {
      const { market } = this

      if (!market) {
        return this.markets
      }

      return this.markets.filter((m) => m.ticker !== market.ticker)
    }
  },

  methods: {
    onClickMarket({ ticker }: UiSpotMarket) {
      this.$router.push({
        name: 'spot-spot',
        params: {
          spot: ticker.replace('/', '-').toLowerCase()
        }
      })
    }
  }
})
</script>
