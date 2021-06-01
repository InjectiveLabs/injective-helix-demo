<template>
  <v-panel :title="$t('price_chart')">
    <div ref="trading-view-wrap" class="h-full w-full relative">
      <v-ui-loading v-if="status.isLoading()" />
      <v-trading-chart
        ref="trading-view"
        :interval="interval"
        :symbol="symbol"
        :datafeed-endpoint="datafeedEndpoint"
        @ready="onReady"
      />
    </div>
  </v-panel>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import TradingChart from '~/components/trading-view/chart.vue'
import { UiDerivativeMarket } from '~/types'
import { app } from '~/app/singletons/App'

interface TradingChartInterface {
  setIndexPriceStudy: Function
  $el: HTMLElement
}

export default Vue.extend({
  components: {
    'v-trading-chart': TradingChart
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: '15'
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    tradingView(): TradingChartInterface {
      return (this.$refs['trading-view'] as unknown) as TradingChartInterface
    },

    tradingViewWrap(): HTMLElement {
      return this.$refs['trading-view-wrap'] as HTMLElement
    },

    symbol(): string {
      if (!this.market) {
        return ''
      }

      return `${this.market.ticker}`
    },

    datafeedEndpoint(): string {
      return `${app.appUrlEndpoint.baseUrl}/chronos/v1/derivative`
    }
  },

  mounted() {
    this.onResize()
    this.status.setIdle()
    window.addEventListener('resize', this.onResize)
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    onResize() {
      //
    },

    onReady() {
      this.status.setIdle()
      this.$nextTick(() => {
        this.tradingView.setIndexPriceStudy()
      })
    }
  }
})
</script>
