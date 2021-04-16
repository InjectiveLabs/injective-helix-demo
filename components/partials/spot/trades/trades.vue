<template>
  <div class="w-full">
    <ul class="list-trades w-full">
      <v-trade
        v-for="(trade, index) in trades"
        :key="`trade-${index}`"
        :trade="trade"
      ></v-trade>
      <v-trade-empty
        v-for="(emptyOrder, index) in emptyTrades"
        :key="`trade-empty-${index}`"
      ></v-trade-empty>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import toPx from 'to-px'
import Trade from './trade.vue'
import TradeEmpty from './trade-empty.vue'
import { UiSpotMarketTrade } from '~/types'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    'v-trade-empty': TradeEmpty
  },

  data() {
    return {
      limit: 10
    }
  },

  computed: {
    trades(): UiSpotMarketTrade[] {
      return this.$accessor.spot.trades
    },

    emptyTrades(): any[] {
      return this.trades.length < this.limit
        ? new Array(this.limit - this.trades.length)
        : []
    }
  },

  mounted() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    onResize() {
      //
    }
  }
})
</script>
