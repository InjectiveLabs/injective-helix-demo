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
    </template>
    <template #context>
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
      :orders="derivativeOrders"
    ></component>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import OpenDerivativeOrders from './orders/derivative-orders.vue'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarket,
  UiSpotLimitOrder
} from '~/types'

const components = {
  openDerivativeOrders: 'v-open-derivative-orders'
}

export default Vue.extend({
  components: {
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

    derivativeOrders(): UiDerivativeLimitOrder[] {
      const { derivativeMarkets, orders } = this
      const derivativeMarketsIds = derivativeMarkets.map(
        ({ marketId }) => marketId
      )

      return orders.filter((o) =>
        derivativeMarketsIds.includes(o.marketId)
      ) as UiDerivativeLimitOrder[]
    }
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleCancelAllDerivativesClick() {
      const { derivativeOrders } = this

      this.$accessor.portfolio
        .batchCancelDerivativeOrders(derivativeOrders)
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
