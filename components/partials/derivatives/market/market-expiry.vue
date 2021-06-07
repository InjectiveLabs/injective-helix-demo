<template>
  <v-market-info v-if="market" :title="$t('expiry_date')">
    <v-ui-text sm class="flex items-center justify-end w-full">
      <v-countdown
        v-if="milisecondsUntilExpiry > 0"
        :time="milisecondsUntilExpiry"
      >
        <template slot-scope="{ days, hours, minutes, seconds }"
          >{{ days >= 10 ? days : '0' + days }} {{ $t('days') }} -
          {{ hours >= 10 ? hours : '0' + hours }}:{{
            minutes >= 10 ? minutes : '0' + minutes
          }}:{{ seconds >= 10 ? seconds : '0' + seconds }}
        </template>
      </v-countdown>
      <span v-else>&mdash;</span>
    </v-ui-text>
  </v-market-info>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import VCountdown from '@chenfengyuan/vue-countdown'
import moment from 'moment'
import { BigNumber } from '@injectivelabs/utils'
import MarketInfo from '~/components/elements/market-info.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo,
    VCountdown
  },

  data() {
    return {
      milisecondsUntilExpiry: 0 as number,
      interval: null as any
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    }
  },

  watch: {
    market(newMarket: UiDerivativeMarket) {
      if (this.milisecondsUntilExpiry <= 0) {
        if (newMarket.expiryFuturesMarketInfo) {
          this.milisecondsUntilExpiry = moment(
            new BigNumber(newMarket.expiryFuturesMarketInfo.expirationTimestamp)
              .times(1000)
              .toNumber()
          ).diff(moment.utc())
        }
      }
    }
  },

  created() {
    if (this.market && this.market.expiryFuturesMarketInfo) {
      this.milisecondsUntilExpiry = moment(
        new BigNumber(this.market.expiryFuturesMarketInfo.expirationTimestamp)
          .times(1000)
          .toNumber()
      ).diff(moment.utc())
    }
  },

  mounted() {
    if (this.milisecondsUntilExpiry) {
      this.interval = setInterval(() => {
        this.milisecondsUntilExpiry = this.milisecondsUntilExpiry - 1000
      }, 1000)
    }
  },

  beforeDestroy() {
    clearInterval(this.interval)
  }
})
</script>
