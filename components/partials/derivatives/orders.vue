<template>
  <v-card-table-wrap class="px-3 pb-3">
    <template #actions>
      <div class="col-span-12 flex justify-between">
        <div class="flex items-center">
          <v-button-filter
            v-model="component"
            :option="components.openPositions"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('activities.openPositions') }}
              <span v-if="position">(1)</span>
            </span>
          </v-button-filter>
          <v-separator />
          <v-button-filter v-model="component" :option="components.openOrders">
            <span class="uppercase text-xs font-semibold">
              {{ $t('activities.openOrders') }}
              {{ `(${orders.length})` }}
            </span>
          </v-button-filter>
          <v-separator />
          <v-button-filter
            v-model="component"
            :option="components.tradeHistory"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('activities.tradeHistory') }}
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
import { Status, StatusType } from '@injectivelabs/utils'
import { UiDerivativeLimitOrder, UiPosition } from '@injectivelabs/ui-common'
import OpenOrders from './orders/index.vue'
import OpenPositions from './positions/index.vue'
import TradeHistory from './trade-history/index.vue'
import HOCLoading from '~/components/hoc/loading.vue'

const components = {
  orderHistory: '',
  openOrders: 'v-open-orders',
  openPositions: 'v-open-positions',
  tradeHistory: 'v-trade-history'
}

export default Vue.extend({
  components: {
    HOCLoading,
    'v-trade-history': TradeHistory,
    'v-open-orders': OpenOrders,
    'v-open-positions': OpenPositions
  },

  data() {
    return {
      status: new Status(StatusType.Loading),

      components,
      component: components.openOrders
    }
  },

  computed: {
    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    position(): UiPosition | undefined {
      return this.$accessor.derivatives.subaccountPosition
    }
  },

  watch: {
    position(
      newPosition: UiPosition | undefined,
      oldPosition: UiPosition | undefined
    ) {
      if (newPosition && !oldPosition) {
        this.component = components.openPositions
      }
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.derivatives.fetchSubaccountPosition(),
      this.$accessor.derivatives.fetchSubaccountTrades()
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
      if (this.position) {
        this.component = components.openPositions
      } else if (this.orders.length > 0) {
        this.component = components.openOrders
      }
    },

    onSelect(component: string) {
      this.component = component
    },

    handleCancelAllClick() {
      const { orders } = this

      this.$accessor.derivatives
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
