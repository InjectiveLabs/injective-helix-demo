<template>
  <v-card>
    <HOCLoading :status="status">
      <v-card-table-wrap>
        <template #context>
          <v-button
            v-if="orders.length > 0 && isUserWalletConnected"
            red-outline
            md
            @click.stop="handleCancelOrders"
          >
            {{ $t('activities.cancelOrders') }}
          </v-button>
        </template>

        <div class="table-responsive min-h-orders max-h-xs 4xl:max-h-lg">
          <table class="table">
            <orders-table-header market-column-enabled />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-order"
                v-for="(order, index) in orders"
                :key="`orders-${index}-${order.orderHash}`"
                :order="order"
              ></tr>
            </tbody>
          </table>
        </div>
      </v-card-table-wrap>
    </HOCLoading>
  </v-card>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import { UiSpotLimitOrder } from '~/types'
import HOCLoading from '~/components/hoc/loading.vue'

export default Vue.extend({
  components: {
    'v-order': Order,
    OrdersTableHeader,
    HOCLoading
  },

  data() {
    return {
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    orders(): UiSpotLimitOrder[] {
      return this.$accessor.activities.subaccountSpotOrders
    }
  },

  mounted() {
    Promise.all([this.$accessor.activities.fetchSubaccountSpotOrders()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleCancelOrders() {
      const { orders } = this

      this.status.setLoading()

      this.$accessor.activities
        .batchCancelSpotOrders(orders)
        .then(() => {
          this.$toast.success(this.$t('activities.cancelOrdersSuccess'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
