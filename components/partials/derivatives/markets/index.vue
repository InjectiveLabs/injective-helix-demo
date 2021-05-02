<template>
  <div class="table-compact">
    <div class="w-full py-2 border-b px-2">
      <div class="w-full relative">
        <v-input
          v-model="filterMarkets"
          :placeholder="$t('filter_markets')"
          class="input-sm w-full"
        >
        </v-input>
        <span class="absolute mr-2 right-0 top-0 mt-1"
          ><v-ui-icon
            :icon="$enums.Icon.Search"
            xs
            class="text-gray-400"
          ></v-ui-icon
        ></span>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th is="v-ui-table-th" left>
              {{ $t('market') }}
            </th>
            <th is="v-ui-table-th" right>
              <v-ui-text>
                {{ $t('last_traded_price') }}
              </v-ui-text>
              <v-ui-icon
                :icon="$enums.Icon.Info"
                class="text-gray-600 hover:text-gray-300"
                :tooltip="$t('last_traded_price_tooltip')"
                2xs
              />
            </th>
            <th is="v-ui-table-th" right>
              <v-ui-text>
                {{ $t('market_change_24h') }}
              </v-ui-text>
            </th>
            <th is="v-ui-table-th" right>
              <v-ui-text>
                {{ $t('market_volume_24h') }}
              </v-ui-text>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            is="v-derivative"
            v-for="(market, index) in filteredMarkets"
            :key="`derivative-markets-${market.ticker}-${index}`"
            v-bind="{ market }"
            @selected="$emit('selected')"
          ></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Derivative from './derivative.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-derivative': Derivative
  },

  data() {
    return {
      filterMarkets: ''
    }
  },

  computed: {
    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    filteredMarkets(): UiDerivativeMarket[] {
      const query = this.filterMarkets.toLowerCase()

      return this.markets.filter((market) => {
        const { ticker, quoteDenom } = market

        return (
          quoteDenom.toLowerCase().startsWith(query) ||
          ticker.toLowerCase().startsWith(query)
        )
      })
    }
  }
})
</script>
