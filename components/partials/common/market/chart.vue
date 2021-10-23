<template>
  <div class="bg-gray-800 rounded-l-xl h-full overflow-hidden shadow-sm">
    <div
      ref="trading-view-wrap"
      class="min-h-sm lg:min-h-full h-full w-full relative"
    >
      <HOCLoading :status="status">
        <v-trading-chart
          ref="trading-view"
          :interval="interval"
          :symbol="symbol"
          :datafeed-endpoint="datafeedEndpoint"
          @ready="onReady"
        />
      </HOCLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import HOCLoading from '~/components/hoc/loading.vue'
import TradingChart from '~/components/trading-view/chart.vue'
import { MarketType, UiDerivativeMarket, UiSpotMarket } from '~/types'
import { app } from '~/app/singletons/App'

interface TradingChartInterface {
  setIndexPriceStudy: Function
  $el: HTMLElement
}

export default Vue.extend({
  components: {
    'v-trading-chart': TradingChart,
    HOCLoading
  },

  props: {
    market: {
      type: Object as PropType<UiSpotMarket | UiDerivativeMarket>,
      required: true
    }
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: '15'
    }
  },

  computed: {
    tradingView(): TradingChartInterface {
      return (this.$refs['trading-view'] as unknown) as TradingChartInterface
    },

    tradingViewWrap(): HTMLElement {
      return this.$refs['trading-view-wrap'] as HTMLElement
    },

    symbol(): string {
      const { market } = this

      if (market.type === MarketType.Derivative) {
        return market.ticker
      }

      return `${(market as UiSpotMarket).baseDenom}/${
        (market as UiSpotMarket).quoteDenom
      }`
    },

    datafeedEndpoint(): string {
      const { market } = this

      return `${app.appUrlEndpoint.baseUrl}/chronos/v1/${
        market.type === MarketType.Derivative ? 'derivative' : 'spot'
      }`
    }
  },

  mounted() {
    this.status.setIdle()
  },

  methods: {
    onReady() {
      this.status.setIdle()
      this.$nextTick(() => {
        this.tradingView.setIndexPriceStudy()
      })
    }
  }
})
</script>
