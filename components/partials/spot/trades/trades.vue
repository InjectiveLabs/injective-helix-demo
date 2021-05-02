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
import { BigNumber } from '@injectivelabs/utils'
import Trade from './trade.vue'
import TradeEmpty from './trade-empty.vue'
import { UiSpotTrade } from '~/types'

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
    trades(): UiSpotTrade[] {
      return this.$accessor.spot.trades
    },

    emptyTrades(): any[] {
      return this.trades.length < this.limit
        ? new Array(this.limit - this.trades.length)
        : []
    }
  },

  mounted() {
    this.$root.$on('resized-trades-panel', this.onResize)

    this.$nextTick(() => {
      this.onResize()
    })
  },

  methods: {
    onResize() {
      const panelContent = this.$el.closest('.v-panel-content') as HTMLElement

      if (!panelContent) {
        return
      }

      const height = panelContent.offsetHeight
      const rowSize = 24
      const totalContentHeight = new BigNumber(height)

      this.limit = totalContentHeight
        .div(rowSize)
        .decimalPlaces(0, BigNumber.ROUND_HALF_CEIL)
        .toNumber()
    }
  }
})
</script>
