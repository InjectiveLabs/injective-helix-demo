<template>
  <div
    :id="containerId"
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
    uid(): string {
      return window.crypto.getRandomValues(new Uint32Array(1))[0].toString()
    },

    containerId(): string {
      const { uid } = this

      return `tv_chart_container-${uid}`
    }
  },

  mounted() {
    const widgetOptions = config({
      containerId: this.containerId,
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
