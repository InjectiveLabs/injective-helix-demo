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
    </div>

    <div class="bg-gray-900 rounded-lg mt-2 orderbook-h">
      <component :is="component" v-if="component"></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Orderbook from './orderbook/index.vue'
import Trades from './trades/index.vue'

const components = {
  orderbook: 'v-orderbook',
  trades: 'v-trades'
}

export default Vue.extend({
  components: {
    'v-trades': Trades,
    'v-orderbook': Orderbook
  },

  data() {
    return {
      components,
      component: components.orderbook
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    }
  }
})
</script>
