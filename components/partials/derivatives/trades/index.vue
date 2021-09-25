<template>
  <div>
    <div v-if="market" class="h-8">
      <table class="table">
        <thead>
          <tr>
            <th class="w-1/3 text-right">
              <span>{{ $t('price') }}</span>
              <v-ui-text emp class="uppercase">
                {{ market.quoteToken.symbol }}
              </v-ui-text>
            </th>
            <th class="w-1/3 text-right">
              <span>{{ $t('amount') }}</span>
              <v-ui-text emp class="uppercase">
                {{ market.baseToken.symbol }}
              </v-ui-text>
            </th>
            <th class="w-1/3 text-right">
              <span>{{ $t('time') }}</span>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    <v-trades class="flex-1" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Trades from './trades.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-trades': Trades
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    }
  }
})
</script>
