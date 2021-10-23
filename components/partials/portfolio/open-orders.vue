<template>
  <v-card-table-wrap>
    <template #filters>
      <v-button-filter
        v-model="component"
        :option="components.openDerivativeOrders"
      >
        <span>
          {{ $t('open_derivatives_order') }}
          {{ `(${derivativeOrders.length})` }}
        </span>
      </v-button-filter>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button-filter v-model="component" :option="components.openSpotOrders">
        <span>
          {{ $t('open_spot_order') }} {{ `(${spotOrders.length})` }}
        </span>
      </v-button-filter>
    </template>
    <template #context>
      <v-button
        v-if="
          component === components.openSpotOrders &&
          spotOrders.length > 0 &&
          isUserWalletConnected
        "
        text-xs
        @click.stop="handleCancelAllSpotClick"
      >
        {{ $t('cancel_all') }}
      </v-button>
      <v-button
        v-if="
          component === components.openDerivativeOrders &&
          derivativeOrders.length > 0 &&
          isUserWalletConnected
        "
        text-xs
        @click.stop="handleCancelAllDerivativesClick"
      >
        {{ $t('cancel_all') }}
      </v-button>
    </template>
    <component
      :is="component"
      v-if="component"
      :orders="currentOrders"
    ></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenSpotOrders from './orders/spot-orders.vue'
import OpenDerivativeOrders from './orders/derivative-orders.vue'
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
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

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

      this.$accessor.portfolio
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

      this.$accessor.portfolio
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
