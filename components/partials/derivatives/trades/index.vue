<template>
  <div class="flex flex-col flex-wrap h-full">
    <div v-if="market" class="h-8 w-full">
      <table class="table">
        <thead xs>
          <tr>
            <th class="w-1/3 text-right">
              <span>{{ $t('price') }}</span>
              <span class="text-white font-semibold uppercase">
                {{ market.quoteToken.symbol }}
              </span>
            </th>
            <th class="w-1/3 text-right">
              <span>{{ $t('amount') }}</span>
              <span class="text-white font-semibold uppercase">
                {{ market.baseToken.symbol }}
              </span>
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
