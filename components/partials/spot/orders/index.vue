<template>
  <div v-if="market" class="table-responsive table-compact">
    <table class="table">
      <thead class="border-b">
        <tr>
          <th is="v-ui-table-th" right>
            <span>{{ $t('price') }}</span>
          </th>
          <th is="v-ui-table-th" right>
            <span>{{ $t('amount') }}</span>
          </th>
          <th is="v-ui-table-th" right>
            <span>{{ $t('total') }}</span>
          </th>
          <th is="v-ui-table-th" center>
            <span>{{ $t('type') }}</span>
          </th>
          <th is="v-ui-table-th" center>
            <span>{{ $t('orders.filled') }}</span>
          </th>
          <th is="v-ui-table-th" center>
            <span>{{ $t('actions') }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          is="v-order"
          v-for="(order, index) in orders"
          :key="`orders-${index}-${order.orderHash}`"
          :order="order"
        ></tr>
        <tr
          is="v-order-empty"
          v-for="(order, index) in emptyOrders"
          :key="`empty-orders-${index}`"
        ></tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Order from './order.vue'
import OrderEmpty from './order-empty.vue'
import WithLoading from '~/components/elements/with-loading.vue'
import { UiSpotMarket, UiSpotMarketOrder } from '~/types'

export default Vue.extend({
  components: {
    'v-order': Order,
    'v-order-empty': OrderEmpty,
    WithLoading
  },

  data() {
    return {
      limit: 14,
      interval: null as any
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    orders(): UiSpotMarketOrder[] {
      const { market } = this

      if (!market) {
        return []
      }

      return this.$accessor.spot.subaccountOrders
    },

    emptyOrders(): any[] {
      const { limit, orders } = this

      return orders.length < limit ? new Array(limit - orders.length) : []
    }
  },

  mounted() {
    //
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    clearInterval(this.interval)
  },

  methods: {
    onResize() {
      //
    }
  }
})
</script>
