<template>
  <MarketInfo
    v-if="market"
    :title="$t('trade.next_funding')"
    :tooltip="$t('trade.next_funding_tooltip')"
  >
    <span class="text-xs lg:text-right font-mono block">
      <v-countdown v-if="msUntilFunding > 0" :time="msUntilFunding">
        <template slot-scope="{ hours, minutes, seconds }">
          {{ hours >= 10 ? hours : '0' + hours }}:{{
            minutes >= 10 ? minutes : '0' + minutes
          }}:{{ seconds >= 10 ? seconds : '0' + seconds }}
        </template>
      </v-countdown>
      <span v-else>&mdash;</span>
    </span>
  </MarketInfo>
</template>

<script lang="ts">
import Vue from 'vue'
// @ts-ignore
import VCountdown from '@chenfengyuan/vue-countdown'
import moment from 'moment'
import { UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import MarketInfo from '~/components/elements/market-info.vue'

export default Vue.extend({
  components: {
    MarketInfo,
    VCountdown
  },

  data() {
    return {
      msUntilFunding: 0 as number,
      interval: null as any
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    perpetualMarket(): boolean {
      const { market } = this

      return !!market && market.isPerpetual
    }
  },

  watch: {
    msUntilFunding(msUntilFunding) {
      // Fetch market's funding when new funding is available
      if (msUntilFunding <= 1000) {
        this.$accessor.derivatives.fetchMarket()
      }
    }
  },

  mounted() {
    if (this.perpetualMarket) {
      this.interval = setInterval(() => {
        this.msUntilFunding = moment.utc().endOf('hour').diff(moment.utc())
      }, 1000)
    }
  },

  beforeDestroy() {
    clearInterval(this.interval)
  }
})
</script>
