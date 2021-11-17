<template>
  <div class="">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          :class="{
            'text-gray-500': component === components.trades
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
            'text-gray-500': component === components.orderbook
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
        @click="handleAggregationChange"
      />
    </div>

    <div class="bg-gray-900 rounded-lg mt-2 orderbook-h">
      <component
        :is="component"
        v-if="component"
        :aggregation="aggregation"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Orderbook from './orderbook/index.vue'
import Trades from './trades/index.vue'
import AggregationSelector from '~/components/partials/common/orderbook/aggregation-selector.vue'
import { UI_DEFAULT_AGGREGATION_DECIMALS } from '~/app/utils/constants'

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
      aggregation: UI_DEFAULT_AGGREGATION_DECIMALS, // default aggregation decimal
      minTick: UI_DEFAULT_AGGREGATION_DECIMALS,
      components,
      component: components.orderbook
    }
  },

  mounted() {
    const market = this.$accessor.spot.market
    if (market && market.priceDecimals) {
      this.aggregation = market.priceDecimals
      this.minTick = market.priceDecimals
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleAggregationChange(aggregation: number) {
      this.aggregation = aggregation
    }
  }
})
</script>
