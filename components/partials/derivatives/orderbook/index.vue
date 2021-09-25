<template>
  <div>
    <div v-if="market" class="h-8">
      <table class="table">
        <thead>
          <tr>
            <th class="w-1/3 text-right">
              <span>{{ $t('price') }}</span>
              <span class="font-bold text-white uppercase">
                {{ market.quoteToken.symbol }}
              </span>
            </th>
            <th class="w-1/3 text-right">
              <span>{{ $t('amount') }}</span>
              <span class="font-bold text-white uppercase">
                {{ market.baseToken.symbol }}
              </span>
            </th>
            <th class="w-1/3 text-right">
              <span>{{ $t('total') }}</span>
              <span class="font-bold text-white uppercase">
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
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-orderbook': OrderBook
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    }
  }
})
</script>
