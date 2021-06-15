<template>
  <v-market-info v-if="market" :title="$t('next_funding')">
    <v-ui-text sm class="flex items-center justify-end w-full">
      <v-countdown
        v-if="milisecondsUntilFunding > 0"
        :time="milisecondsUntilFunding"
      >
        <template slot-scope="{ hours, minutes, seconds }"
          >{{ hours >= 10 ? hours : '0' + hours }}:{{
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
import MarketInfo from '~/components/elements/market-info.vue'
import { UiDerivativeMarket } from '~/types'

export default Vue.extend({
  components: {
    'v-market-info': MarketInfo,
    VCountdown
  },

  data() {
    return {
      milisecondsUntilFunding: 0 as number,
      interval: null as any
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    perpetualMarket(): boolean {
      const { market } = this

      return !!market && market.isPerpetual
    }
  },

  created() {
    if (this.perpetualMarket) {
      this.milisecondsUntilFunding = moment.utc().endOf('hour').milliseconds()
    }
  },

  mounted() {
    if (this.perpetualMarket) {
      this.interval = setInterval(() => {
        if (this.milisecondsUntilFunding - 1000 >= 0) {
          this.milisecondsUntilFunding = this.milisecondsUntilFunding - 1000
        } else {
          this.milisecondsUntilFunding = moment
            .utc()
            .endOf('hour')
            .diff(moment.utc())
        }
      }, 1000)
    }
  },

  beforeDestroy() {
    clearInterval(this.interval)
  }
})
</script>
