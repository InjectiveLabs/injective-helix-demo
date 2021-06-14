<template>
  <v-market-info v-if="market" :title="$t('expiry_date')">
    <v-ui-text sm class="flex items-center justify-end w-full">
      <span v-if="expiryAt">{{ expiryAt }}</span>
      <span v-else>&mdash;</span>
    </v-ui-text>
  </v-market-info>
</template>

<script lang="ts">
import Vue from 'vue'
import { fromUnixTime, formatDistanceToNow } from 'date-fns'
import MarketInfo from '~/components/elements/market-info.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo
  },

  data() {
    return {
      //
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    expiryAt(): string {
      const { market } = this

      if (!market || !market.expiryFuturesMarketInfo) {
        return ''
      }

      return formatDistanceToNow(
        fromUnixTime(market.expiryFuturesMarketInfo.expirationTimestamp),
        {
          addSuffix: true
        }
      )
    }
  }
})
</script>
