<template>
  <div class="bg-gray-800 lg:rounded-l-xl lg:shadow-sm h-full overflow-hidden">
    <div
      ref="trading-view-wrap"
      class="orderbook-h lg:h-full lg:min-h-full h-full w-full relative flex"
    >
      <VHocLoading :status="status">
        <v-trading-chart
          ref="trading-view"
          :interval="interval"
          :symbol="symbol"
          :datafeed-endpoint="datafeedEndpoint"
          @ready="onReady"
        />
      </VHocLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  UiDerivativeMarketWithToken,
  MarketType
} from '@injectivelabs/ui-common'
import TradingChart from '~/components/trading-view/chart.vue'
import { getChronosDatafeedEndpoint } from '~/app/utils/helpers'

interface TradingChartInterface {
  $el: HTMLElement
}

export default Vue.extend({
  components: {
    'v-trading-chart': TradingChart
  },

  props: {
    market: {
      type: Object as PropType<
        UiSpotMarketWithToken | UiDerivativeMarketWithToken
      >,
      required: true
    }
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: '120'
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

      const spotTicker = `${(market as UiSpotMarketWithToken).baseDenom}/${
        (market as UiSpotMarketWithToken).quoteDenom
      }`

      return spotTicker.replaceAll('ibc/', 'ibc@')
    },

    datafeedEndpoint(): string {
      const { market } = this

      return getChronosDatafeedEndpoint(
        market.type === MarketType.Derivative ? 'derivative' : 'spot'
      )
    }
  },

  mounted() {
    this.status.setIdle()
  },

  methods: {
    onReady() {
      setTimeout(() => {
        this.status.setIdle()
      }, 3000)
    }
  }
})
</script>
