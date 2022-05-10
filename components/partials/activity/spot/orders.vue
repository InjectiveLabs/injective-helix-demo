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
          class="col-span-12 sm:col-span-6 lg:col-span-8 sm:text-right mt-4 sm:mt-0"
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

      <v-table-wrapper break-md class="mt-4">
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
        <span class="font-semibold text-lg">
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
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
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
