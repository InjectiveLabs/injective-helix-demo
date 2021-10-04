<template>
  <div class="flex-1">
    <div class="flex items-center justify-between">
      <div class="flex items-center justify-center">
        <v-button
          :class="{
            'text-gray-500': component === components.openSpotOrders
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.openDerivativeOrders)"
        >
          <span>
            {{ $t('open_derivatives_order') }}
            {{ `(${derivativeOrders.length})` }}
          </span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-500"></div>
        <v-button
          :class="{
            'text-gray-500': component === components.openDerivativeOrders
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelect(components.openSpotOrders)"
        >
          <span>
            {{ $t('open_spot_order') }} {{ `(${spotOrders.length})` }}
          </span>
        </v-button>
      </div>

      <v-button
        v-if="component === components.openSpotOrders && spotOrders.length > 0"
        text-xs
        @click.stop="handleCancelAllSpotClick"
      >
        {{ $t('cancel_all') }}
      </v-button>
      <v-button
        v-if="
          component === components.openDerivativeOrders &&
          derivativeOrders.length > 0
        "
        text-xs
        @click.stop="handleCancelAllDerivativesClick"
      >
        {{ $t('cancel_all') }}
      </v-button>
    </div>

    <div class="bg-gray-900 px-4 py-2 rounded-lg mt-2">
      <component
        :is="component"
        v-if="component"
        :orders="currentOrders"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenSpotOrders from './spot-orders/index.vue'
import OpenDerivativeOrders from './derivative-orders/index.vue'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarket,
  UiSpotLimitOrder,
  UiSpotMarket
} from '~/types'

const components = {
  openSpotOrders: 'v-open-spot-orders',
  openDerivativeOrders: 'v-open-derivative-orders'
}

export default Vue.extend({
  components: {
    'v-open-spot-orders': OpenSpotOrders,
    'v-open-derivative-orders': OpenDerivativeOrders
  },

  data() {
    return {
      components,
      component: components.openDerivativeOrders
    }
  },

  computed: {
    orders(): Array<UiSpotLimitOrder | UiDerivativeLimitOrder> {
      return this.$accessor.portfolio.subaccountOrders
    },

    derivativeMarkets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    spotOrders(): UiSpotLimitOrder[] {
      const { spotMarkets, orders } = this
      const spotMarketsIds = spotMarkets.map(({ marketId }) => marketId)

      return orders.filter((o) =>
        spotMarketsIds.includes(o.marketId)
      ) as UiSpotLimitOrder[]
    },

    derivativeOrders(): UiDerivativeLimitOrder[] {
      const { derivativeMarkets, orders } = this
      const derivativeMarketsIds = derivativeMarkets.map(
        ({ marketId }) => marketId
      )

      return orders.filter((o) =>
        derivativeMarketsIds.includes(o.marketId)
      ) as UiDerivativeLimitOrder[]
    },

    currentOrders(): Array<UiSpotLimitOrder | UiDerivativeLimitOrder> {
      const { derivativeOrders, component, spotOrders } = this

      return component === components.openDerivativeOrders
        ? derivativeOrders
        : spotOrders
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleCancelAllSpotClick() {
      const { spotOrders } = this

      this.$accessor.spot
        .batchCancelOrder(spotOrders)
        .then(() => {
          this.$toast.success(this.$t('orders_cancelled'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    },

    handleCancelAllDerivativesClick() {
      const { derivativeOrders } = this

      this.$accessor.derivatives
        .batchCancelOrder(derivativeOrders)
        .then(() => {
          this.$toast.success(this.$t('orders_cancelled'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    }
  }
})
</script>
