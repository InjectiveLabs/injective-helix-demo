<template>
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

        <div
          class="col-span-12 flex justify-between items-center sm:hidden my-3 text-xs px-3"
        >
          <span class="tracking-widest uppercase tracking-3">
            {{ $t('trade.side') }} / {{ $t('trade.market') }}
          </span>
          <span
            class="text-red-550 leading-5 cursor-pointer"
            @click.stop="handleCancelOrders"
          >
            {{ $t('trade.cancelAll') }}
          </span>
        </div>

        <div
          class="col-span-6 lg:col-span-8 sm:text-right mt-0 hidden sm:block"
        >
          <v-button
            v-if="filteredOrders.length > 0"
            red-outline
            md
            @click.stop="handleCancelOrders"
          >
            {{ $t('trade.cancelAllOrders') }}
          </v-button>
        </div>
      </template>

      <!-- mobile table -->
      <TableBody :show-empty="filteredOrders.length === 0" class="sm:hidden">
        <mobile-order
          v-for="(order, index) in filteredOrders"
          :key="`mobile-spot-orders-${index}-${order.orderHash}`"
          class="col-span-1"
          :order="order"
        />

        <v-empty-list
          slot="empty"
          :message="$t('trade.emptyOrders')"
          class="mt-6 min-h-orders"
        />
      </TableBody>

      <v-table-wrapper break-md class="mt-4 hidden sm:block">
        <table v-if="filteredOrders.length > 0" class="table">
          <orders-table-header />
          <tbody>
            <tr
              is="v-order"
              v-for="(order, index) in filteredOrders"
              :key="`orders-${index}-${order.orderHash}`"
              :order="order"
            />
          </tbody>
        </table>
        <v-empty-list v-else :message="$t('trade.emptyOrders')" />
      </v-table-wrapper>

      <portal to="activity-card-spot-count">
        <span class="font-semibold text-sm md:text-lg">
          {{ orders.length }}
        </span>
      </portal>

      <portal to="activity-tab-spot-count">
        <span v-if="status.isNotLoading()"> ({{ orders.length }}) </span>
      </portal>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import MobileOrder from '~/components/partials/common/spot/mobile-order.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    'v-order': Order,
    FilterSelector,
    MobileOrder,
    OrdersTableHeader,
    TableBody
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
    orders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    filteredOrders(): UiSpotLimitOrder[] {
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
    this.status.setLoading()

    Promise.all([this.$accessor.spot.fetchSubaccountOrders()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
        this.$root.$emit('spot-tab-loaded')
      })
  },

  methods: {
    cancelOrder(): Promise<void> {
      const { filteredOrders } = this

      const [order] = filteredOrders

      return this.$accessor.spot.cancelOrder(order)
    },

    cancelAllOrders(): Promise<void> {
      const { filteredOrders } = this

      return this.$accessor.spot.batchCancelOrder(filteredOrders)
    },

    handleCancelOrders() {
      const { filteredOrders } = this

      const action =
        filteredOrders.length === 1 ? this.cancelOrder : this.cancelAllOrders

      action()
        .then(() => {
          this.$toast.success(this.$t('trade.orders_cancelled'))
        })
        .catch(this.$onRejected)
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
