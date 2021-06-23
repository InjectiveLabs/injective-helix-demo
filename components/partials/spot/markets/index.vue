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
          ><v-ui-icon :icon="Icon.Search" xs class="text-gray-400"></v-ui-icon
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
            is="v-spot"
            v-for="({ market, summary }, index) in filteredMarkets"
            :key="`spot-markets-${market.ticker}-${index}`"
            v-bind="{ market, marketSummary: summary }"
            @selected="$emit('selected')"
          ></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Spot from './spot.vue'
import {
  UiSpotMarket,
  UiSpotMarketSummary,
  UiSpotMarketAndSummary,
  Icon
} from '~/types'

export default Vue.extend({
  components: {
    'v-spot': Spot
  },

  data() {
    return {
      filterMarkets: '',
      Icon
    }
  },

  computed: {
    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    marketsSummary(): UiSpotMarketSummary[] {
      return this.$accessor.spot.marketsSummary
    },

    filteredMarkets(): UiSpotMarketAndSummary[] {
      const { filterMarkets, markets, marketsSummary } = this

      const query = filterMarkets.toLowerCase()

      return markets
        .map((market) => {
          return {
            market,
            summary: marketsSummary.find(
              (summary) => summary.marketId === market.marketId
            )
          }
        })
        .filter(({ market, summary }) => {
          const { ticker, baseDenom, quoteDenom } = market
          const satisfiesSearchCondition =
            baseDenom.toLowerCase().startsWith(query) ||
            quoteDenom.toLowerCase().startsWith(query) ||
            ticker.toLowerCase().startsWith(query)

          return satisfiesSearchCondition && summary !== undefined
        }) as UiSpotMarketAndSummary[]
    }
  }
})
</script>
