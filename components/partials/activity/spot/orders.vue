<template>
  <HocLoading :status="status">
    <VCardTableWrap>
      <template #actions>
        <div
          class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
        >
          <VSearch
            dense
            class="col-span-3"
            data-cy="universal-table-filter-by-asset-input"
            :placeholder="$t('trade.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />
          <FilterSelector
            class="col-span-2"
            data-cy="universal-table-filter-by-side-drop-down"
            :type="TradeSelectorType.Side"
            :value="side"
            @click="handleSideClick"
          />
        </div>

        <div
          v-if="filteredOrders.length > 0"
          class="col-span-12 flex justify-between items-center sm:hidden mt-3 text-xs px-3"
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
          <VButton
            v-if="filteredOrders.length > 0"
            red-outline
            md
            data-cy="activity-cancel-all-button"
            @click.stop="handleCancelOrders"
          >
            {{ $t('trade.cancelAllOrders') }}
          </VButton>
        </div>
      </template>

      <!-- mobile table -->
      <TableBody
        :show-empty="filteredOrders.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <MobileOrder
          v-for="(order, index) in filteredOrders"
          :key="`mobile-spot-orders-${index}-${order.orderHash}`"
          class="col-span-1"
          :order="order"
        />

        <EmptyList slot="empty" :message="$t('trade.emptyOrders')" />
      </TableBody>

      <TableWrapper break-md class="mt-4 hidden sm:block">
        <table v-if="filteredOrders.length > 0" class="table">
          <OrdersTableHeader />
          <tbody>
            <tr
              is="Order"
              v-for="(order, index) in filteredOrders"
              :key="`orders-${index}-${order.orderHash}`"
              :order="order"
            />
          </tbody>
        </table>
        <EmptyList
          v-else
          :message="$t('trade.emptyOrders')"
          data-cy="universal-table-nothing-found"
        />
      </TableWrapper>

      <portal to="activity-card-spot-count">
        <span class="font-semibold text-sm md:text-lg">
          {{ orders.length }}
        </span>
      </portal>

      <portal to="activity-tab-spot-count">
        <span v-if="status.isNotLoading()"> ({{ orders.length }}) </span>
      </portal>
    </VCardTableWrap>
  </HocLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiSpotLimitOrder,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import MobileOrder from '~/components/partials/common/spot/mobile-order.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    Order,
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

        if (!market) {
          return false
        }

        if (!search && !side) {
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
