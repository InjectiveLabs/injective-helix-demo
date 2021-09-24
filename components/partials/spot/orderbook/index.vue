<template>
  <div>
    <div v-if="market" class="table-compact h-8">
      <table class="table">
        <thead>
          <tr>
            <th is="v-ui-table-th" class="w-1/3 text-xs" right>
              <span>{{ $t('price') }}</span>
              <span class="text-white uppercase">
                {{ market.quoteToken.symbol }}
              </span>
            </th>
            <th is="v-ui-table-th" class="w-1/3 text-xs" right>
              <span>{{ $t('amount') }}</span>
              <span class="text-white uppercase">
                {{ market.baseToken.symbol }}
              </span>
            </th>
            <th is="v-ui-table-th" class="w-1/3 text-xs" right>
              <span>{{ $t('total') }}</span>
              <span class="text-white uppercase">
                {{ market.quoteToken.symbol }}
              </span>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    <v-orderbook />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import OrderBook from './order-book.vue'
import { UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-orderbook': OrderBook
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    }
  }
})
</script>
