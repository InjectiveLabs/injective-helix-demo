<template>
  <div
    id="tv_chart_container"
    ref="tradingView"
    class="tv_chart_container w-full"
  ></div>
</template>

<script lang="ts">
import Vue from 'vue'
import config from './config'
import { widget as TradingWidget } from '~/static/chart/charting_library/charting_library.min'

export default Vue.extend({
  props: {
    symbol: {
      required: true,
      type: String
    },

    interval: {
      required: true,
      type: String
    },

    datafeedEndpoint: {
      required: true,
      type: String
    }
  },

  data() {
    return {
      tradingView: null as any
    }
  },

  computed: {
    //
  },

  mounted() {
    const widgetOptions = config({
      symbol: this.symbol,
      interval: this.interval,
      datafeedEndpoint: this.datafeedEndpoint
    })

    // @ts-ignore
    this.tradingView = new TradingWidget(widgetOptions)
    this.tradingView.onChartReady(() => {
      this.$emit('ready')
    })
  }
})
</script>
