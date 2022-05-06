<template>
  <div class="lg:p-3">
    <div class="flex items-center justify-between flex-wrap">
      <div class="flex items-center gap-4 px-4 py-3 lg:pt-0 lg:px-0">
        <v-tab-selector-item
          v-model="component"
          :option="components.charts"
          class="lg:hidden"
        >
          <span>{{ $t('trade.chart') }}</span>
        </v-tab-selector-item>

        <v-tab-selector-item v-model="component" :option="components.orderbook">
          <span>{{ $t('trade.orderbook') }}</span>
        </v-tab-selector-item>

        <v-tab-selector-item v-model="component" :option="components.trades">
          <span>{{ $t('trade.trades') }}</span>
        </v-tab-selector-item>
      </div>
    </div>

    <div class="bg-gray-900 rounded-lg orderbook-h relative">
      <div class="flex px-4">
        <v-aggregation-selector
          v-if="component === components.orderbook"
          class="ml-auto py-1"
          :min-tick="minTick"
          :value="aggregation"
          :max-tick="maxTick"
          @click="handleAggregationChange"
        />
      </div>
      <VHocLoading :status="status">
        <div>
          <v-market-chart
            v-show="component === components.charts"
            :market="market"
            class="lg:hidden"
          />
          <v-orderbook
            v-if="component === components.orderbook"
            :aggregation="Number(aggregation)"
          />
          <v-trades v-if="component === components.trades" />
        </div>
      </VHocLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { debounce } from 'lodash'
import { UiDerivativeMarketWithToken } from '@injectivelabs/ui-common'
import VOrderbook from './orderbook/index.vue'
import VTrades from './trades/index.vue'
import VAggregationSelector from '~/components/partials/common/orderbook/aggregation-selector.vue'
import VMarketChart from '~/components/partials/common/market/chart.vue'
import VTabSelectorItem from '~/components/partials/common/market/tab-selector-item.vue'
import { UI_DEFAULT_AGGREGATION_DECIMALS_STRING } from '~/app/utils/constants'
import {
  customAggregations,
  getDecimalPlaceFromValue
} from '~/app/data/aggregation'

const components = {
  charts: 'v-market-chart',
  orderbook: 'v-orderbook',
  trades: 'v-trades'
}

export default Vue.extend({
  components: {
    VAggregationSelector,
    VMarketChart,
    VTabSelectorItem,
    VTrades,
    VOrderbook
  },

  props: {
    market: {
      type: Object as PropType<UiDerivativeMarketWithToken>,
      required: true
    }
  },

  data() {
    return {
      viewport: 1024,
      status: new Status(StatusType.Loading),

      components,
      aggregation: UI_DEFAULT_AGGREGATION_DECIMALS_STRING,
      minTick: UI_DEFAULT_AGGREGATION_DECIMALS_STRING,
      component: components.orderbook,
      maxTick: null as string | null
    }
  },

  mounted() {
    this.$nextTick(() => this.onResize())
    window.addEventListener('resize', debounce(this.onResize, 100))

    Promise.all([
      this.$accessor.derivatives.fetchOrderbook(),
      this.$accessor.derivatives.fetchTrades()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
        this.onInit()
      })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    onResize() {
      const { viewport } = this

      if (viewport >= 1024 && window.innerWidth < 1024) {
        this.component = components.charts
      }

      if (viewport < 1024 && window.innerWidth >= 1024) {
        this.component = components.orderbook
      }

      this.viewport = window.innerWidth
    },

    onInit() {
      const market = this.$accessor.derivatives.market

      if (market && market.minQuantityTickSize) {
        const minTickSize =
          getDecimalPlaceFromValue(market.minQuantityTickSize.toString()) ||
          UI_DEFAULT_AGGREGATION_DECIMALS_STRING

        this.minTick = minTickSize

        const customAggregation = customAggregations[market.ticker]

        if (!customAggregation) {
          return
        }

        // applies custom aggregation base on pre configured settings
        if (customAggregation.minTick) {
          this.minTick = customAggregation.minTick
        }
        this.maxTick = customAggregation.maxTick || null
        this.aggregation = customAggregation.default || minTickSize
      }
    },

    handleAggregationChange(aggregation: string) {
      this.aggregation = aggregation
    }
  }
})
</script>
