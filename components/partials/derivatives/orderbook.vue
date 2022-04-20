<template>
  <div class="p-2 lg:p-3">
    <div class="flex items-center justify-between flex-wrap">
      <div class="flex items-center">
        <v-button
          :class="{
            'text-gray-500': component !== components.orderbook
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.orderbook)"
        >
          <span>{{ $t('trade.orderbook') }}</span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-700"></div>
        <v-button
          :class="{
            'text-gray-500': component !== components.trades
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.trades)"
        >
          <span>{{ $t('trade.trades') }}</span>
        </v-button>
      </div>
      <v-aggregation-selector
        v-if="component === components.orderbook"
        class="pr-2 ml-auto"
        :min-tick="minTick"
        :value="aggregation"
        :max-tick="maxTick"
        @click="handleAggregationChange"
      />
    </div>

    <div class="bg-gray-900 rounded-lg mt-2 orderbook-h relative">
      <VHocLoading :status="status">
        <component
          :is="component"
          v-if="component"
          :aggregation="Number(aggregation)"
        ></component>
      </VHocLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import Orderbook from './orderbook/index.vue'
import Trades from './trades/index.vue'
import AggregationSelector from '~/components/partials/common/orderbook/aggregation-selector.vue'
import { UI_DEFAULT_AGGREGATION_DECIMALS_STRING } from '~/app/utils/constants'
import {
  customAggregations,
  getDecimalPlaceFromValue
} from '~/app/data/aggregation'

const components = {
  orderbook: 'v-orderbook',
  trades: 'v-trades'
}

export default Vue.extend({
  components: {
    'v-aggregation-selector': AggregationSelector,
    'v-trades': Trades,
    'v-orderbook': Orderbook
  },

  data() {
    return {
      status: new Status(StatusType.Loading),

      components,
      aggregation: UI_DEFAULT_AGGREGATION_DECIMALS_STRING,
      minTick: UI_DEFAULT_AGGREGATION_DECIMALS_STRING,
      component: components.orderbook,
      maxTick: null as string | null
    }
  },

  mounted() {
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

  methods: {
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

    onSelect(component: string) {
      this.component = component
    },

    handleAggregationChange(aggregation: string) {
      this.aggregation = aggregation
    }
  }
})
</script>
