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
              <span emp class="uppercase">
                {{ market.baseToken.symbol }}
              </span>
            </th>
            <th is="v-ui-table-th" class="w-1/3 text-xs" right>
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
import { UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-trades': Trades
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    }
  }
})
</script>
