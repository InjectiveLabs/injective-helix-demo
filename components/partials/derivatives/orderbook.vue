<template>
  <div class="">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          :class="{
            'text-gray-500': component !== components.orderbook
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.orderbook)"
        >
          <span>{{ $t('Orderbook') }}</span>
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
          <span>{{ $t('trades') }}</span>
        </v-button>
      </div>
      <v-aggregation-selector
        v-if="component === components.orderbook"
        class="pr-2"
        :min-tick="minTick"
        :value="aggregation"
        :max-tick="maxTick"
        @click="handleAggregationChange"
      />
    </div>

    <div class="bg-gray-900 rounded-lg mt-2 orderbook-h relative">
      <HOCLoading :status="status">
        <component
          :is="component"
          v-if="component"
          :aggregation="Number(aggregation)"
        ></component>
      </HOCLoading>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import Orderbook from './orderbook/index.vue'
import Trades from './trades/index.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import AggregationSelector from '~/components/partials/common/orderbook/aggregation-selector.vue'
import {
  UI_DEFAULT_AGGREGATION_DECIMALS,
  UI_DEFAULT_AGGREGATION_DECIMALS_STRING
} from '~/app/utils/constants'
import { customAggregations } from '~/app/data/aggregation'

const components = {
  orderbook: 'v-orderbook',
  trades: 'v-trades'
}

export default Vue.extend({
  components: {
    HOCLoading,
    'v-aggregation-selector': AggregationSelector,
    'v-trades': Trades,
    'v-orderbook': Orderbook
  },

  data() {
    return {
      status: new Status(StatusType.Loading),

      components,
      aggregation: UI_DEFAULT_AGGREGATION_DECIMALS_STRING,
      minTick: UI_DEFAULT_AGGREGATION_DECIMALS,
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

      if (market && market.priceDecimals) {
        this.minTick = market.priceDecimals

        const customAggregation = customAggregations[market.ticker]

        if (!customAggregation) {
          return
        }

        // applies custom aggregation base on pre configured settings
        this.maxTick = customAggregation.maxTick || null
        this.aggregation =
          customAggregation.default || market.priceDecimals.toString()
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
