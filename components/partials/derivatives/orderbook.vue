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

    <div class="bg-gray-900 rounded-lg mt-2 orderbook-h">
      <component
        :is="component"
        v-if="component"
        :aggregation="Number(aggregation)"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Orderbook from './orderbook/index.vue'
import Trades from './trades/index.vue'
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
    'v-aggregation-selector': AggregationSelector,
    'v-trades': Trades,
    'v-orderbook': Orderbook
  },

  data() {
    return {
      aggregation: UI_DEFAULT_AGGREGATION_DECIMALS_STRING,
      minTick: UI_DEFAULT_AGGREGATION_DECIMALS,
      components,
      component: components.orderbook,
      maxTick: null as string | null
    }
  },

  mounted() {
    const market = this.$accessor.derivatives.market
    if (market && market.priceDecimals) {
      const customAggregation = customAggregations[market.ticker]
      this.minTick = market.priceDecimals

      // applies custom aggregation base on pre configured settings
      this.maxTick = customAggregation?.maxTick || null
      this.aggregation =
        customAggregation?.default || market.priceDecimals.toString()
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleAggregationChange(aggregation: string) {
      this.aggregation = aggregation
    }
  }
})
</script>
