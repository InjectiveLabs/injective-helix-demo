<template>
  <v-card-table-wrap class="px-3 pb-3">
    <template #actions>
      <div class="col-span-12 flex justify-between">
        <div class="flex items-center">
          <v-button-filter v-model="component" :option="components.openOrders">
            <span class="uppercase text-xs font-semibold">
              {{ $t('open_orders') }}
              {{ `(${orders.length})` }}
            </span>
          </v-button-filter>
          <v-separator />
          <v-button-filter
            v-model="component"
            :option="components.tradeHistory"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('trade_history') }}
            </span>
          </v-button-filter>
        </div>

        <v-button
          v-if="component === components.openOrders && orders.length > 0"
          red-outline
          md
          @click.stop="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </v-button>
      </div>
    </template>

    <HOCLoading :status="status">
      <component :is="component" v-if="component"></component>
    </HOCLoading>
  </v-card-table-wrap>
</template>

<script lang="ts">
import Vue from 'vue'
import { UiSpotLimitOrder } from '@injectivelabs/ui-common'
import { Status, StatusType } from '@injectivelabs/utils'
import OpenOrders from './orders/index.vue'
import TradeHistory from './trade-history/index.vue'
import HOCLoading from '~/components/hoc/loading.vue'

const components = {
  orderHistory: '',
  openOrders: 'v-open-orders',
  tradeHistory: 'v-trade-history'
}

export default Vue.extend({
  components: {
    HOCLoading,
    'v-trade-history': TradeHistory,
    'v-open-orders': OpenOrders
  },

  data() {
    return {
      status: new Status(StatusType.Loading),

      components,
      component: components.openOrders
    }
  },

  computed: {
    orders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.spot.fetchSubaccountOrders(),
      this.$accessor.spot.fetchSubaccountTrades()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    onSelect(component: string) {
      this.component = component
    },

    handleCancelAllClick() {
      const { orders } = this

      this.$accessor.spot
        .batchCancelOrder(orders)
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
