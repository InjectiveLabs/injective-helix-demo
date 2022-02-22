<template>
  <v-card lg>
    <VHocLoading :status="status">
      <v-card-table-wrap>
        <template #actions>
          <div
            class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
          >
            <v-search
              dense
              class="col-span-3"
              :placeholder="$t('trade.filter')"
              :search="search"
              @searched="handleInputOnSearch"
            />
            <filter-selector
              class="col-span-2"
              :type="TradeSelectorType.Side"
              :value="side"
              @click="handleSideClick"
            />
          </div>

          <div class="col-span-12 sm:col-span-6 lg:col-span-8 sm:text-right">
            <v-button
              v-if="orders.length > 0 && isUserWalletConnected"
              red-outline
              md
              @click.stop="handleCancelOrders"
            >
              {{ $t('trade.cancelAllOrders') }}
            </v-button>
          </div>
        </template>

        <div
          v-if="filteredOrders.length > 0"
          class="table-responsive min-h-orders max-h-lg mt-6"
        >
          <table class="table">
            <orders-table-header market-column-enabled />
            <tbody v-if="isUserWalletConnected">
              <tr
                is="v-order"
                v-for="(order, index) in filteredOrders"
                :key="`orders-${index}-${order.orderHash}`"
                :order="order"
              ></tr>
            </tbody>
          </table>
        </div>
        <v-empty-list
          v-else
          :message="$t('trade.emptyOrders')"
          class="mt-6 min-h-orders"
        />
      </v-card-table-wrap>
    </VHocLoading>
  </v-card>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import Order from '~/components/partials/common/derivatives/order.vue'
import OrdersTableHeader from '~/components/partials/common/derivatives/orders-table-header.vue'
import FilterSelector from '~/components/partials/common/trades/trade-dropdown-filter.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    'v-order': Order,
    FilterSelector,
    OrdersTableHeader
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.activities.subaccountDerivativeOrders
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredOrders(): UiDerivativeLimitOrder[] {
      const { markets, search, orders, side } = this

      return orders.filter((o) => {
        const market = markets.find((m) => m.marketId === o.marketId)

        if (!market || (!search && !side)) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          market.ticker.toLowerCase().includes(search.trim().toLowerCase())
        const isPartOfSideFilter = !side || o.orderSide === side

        return isPartOfSearchFilter && isPartOfSideFilter
      })
    }
  },

  mounted() {
    Promise.all([this.$accessor.activities.fetchSubaccountDerivativeOrders()])
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
        .batchCancelDerivativeOrders(orders)
        .then(() => {
          this.$toast.success(this.$t('activities.cancelOrdersSuccess'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleInputOnSearch(search: string) {
      this.search = search
    },

    handleSideClick(side: string | undefined) {
      this.side = side
    }
  }
})
</script>
