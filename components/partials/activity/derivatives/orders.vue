<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <Toolbar>
        <template #filters>
          <SearchAsset
            :markets="markets"
            :value="selectedToken"
            @select="handleSearch"
          />

          <FilterSelector
            class="min-w-3xs"
            data-cy="universal-table-filter-by-side-drop-down"
            :type="TradeSelectorType.Side"
            :value="side"
            @click="handleSideClick"
          />

          <ClearFiltersButton
            v-if="showClearFiltersButton"
            @clear="handleClearFilters"
          />
        </template>

        <template #actions>
          <div
            v-if="orders.length > 0"
            class="col-span-4 md:col-span-3 lg:col-span-2 flex justify-between items-center sm:hidden mt-3 text-xs px-3"
          >
            <span class="tracking-widest uppercase tracking-3">
              {{ $t('trade.side') }} / {{ $t('trade.market') }}
            </span>
            <span
              class="text-red-500 leading-5 cursor-pointer"
              @click.stop="handleCancelOrders"
            >
              {{ $t('trade.cancelAll') }}
            </span>
          </div>

          <div
            class="col-span-4 md:col-span-3 lg:col-span-2 sm:text-right mt-0 hidden sm:block"
          >
            <VButton
              v-if="orders.length > 0"
              red-outline
              md
              data-cy="activity-cancel-all-button"
              @click.stop="handleCancelOrders"
            >
              {{ $t('trade.cancelAllOrders') }}
            </VButton>
          </div>
        </template>
      </Toolbar>

      <!-- mobile table -->
      <TableBody
        :show-empty="orders.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <MobileOrder
          v-for="(order, index) in orders"
          :key="`mobile-derivative-orders-${index}-${order.orderHash}`"
          class="col-span-1"
          :order="order"
        />

        <EmptyList slot="empty" :message="$t('trade.emptyOrders')" />
      </TableBody>

      <TableWrapper break-md class="mt-4 hidden sm:block">
        <table v-if="orders.length > 0" class="table">
          <OrdersTableHeader />
          <tbody>
            <tr
              is="Order"
              v-for="(order, index) in orders"
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

      <portal to="activity-card-derivative-count">
        <span class="font-semibold text-sm md:text-lg">
          {{ orders.length }}
        </span>
      </portal>

      <portal to="activity-tab-derivative-count">
        <span v-if="status.isNotLoading()"> ({{ orders.length }}) </span>
      </portal>

      <Pagination
        v-if="status.isIdle()"
        class="mt-4"
        v-bind="{
          limit,
          page,
          totalPages,
          totalCount
        }"
        @update:limit="handleLimitChangeEvent"
        @update:page="handlePageChangeEvent"
      />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  DerivativeOrderSide,
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import MobileOrder from '~/components/partials/common/derivatives/mobile-order.vue'
import Order from '~/components/partials/common/derivatives/order.vue'
import OrdersTableHeader from '~/components/partials/common/derivatives/orders-table-header.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import SearchAsset from '@/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '@/components/partials/activity/common/clear-filters-button.vue'
import Toolbar from '@/components/partials/activity/common/toolbar.vue'

export default Vue.extend({
  components: {
    Order,
    FilterSelector,
    MobileOrder,
    OrdersTableHeader,
    TableBody,
    Pagination,
    SearchAsset,
    ClearFiltersButton,
    Toolbar
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading),
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
      selectedToken: undefined as Token | undefined
    }
  },

  computed: {
    activeMarketIds(): string[] {
      return this.$accessor.derivatives.activeMarketIds
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    totalCount(): number {
      return this.$accessor.derivatives.subaccountOrdersTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken || !!this.side
    }
  },

  mounted() {
    this.fetchOrders().finally(() => {
      this.$root.$emit('derivative-tab-loaded')
    })
  },

  methods: {
    fetchOrders(): Promise<void> {
      this.status.setLoading()

      const orderSide = this.side as DerivativeOrderSide
      const marketId = this.markets.find((m) => {
        return (
          m.baseToken.symbol === this.selectedToken?.symbol ||
          m.quoteToken.symbol === this.selectedToken?.symbol
        )
      })?.marketId

      return Promise.all([
        this.$accessor.derivatives.fetchSubaccountOrders({
          pagination: {
            skip: (this.page - 1) * this.limit,
            limit: this.limit
          },
          filters: {
            marketId,
            marketIds: this.activeMarketIds,
            orderSide
          }
        })
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    cancelAllOrder(): Promise<void> {
      const { orders } = this

      return this.$accessor.derivatives.batchCancelOrder(orders)
    },

    cancelOrder(): Promise<void> {
      const { orders } = this

      const [order] = orders

      return this.$accessor.derivatives.cancelOrder(order)
    },

    handleCancelOrders() {
      const { orders } = this

      const action =
        orders.length === 1 ? this.cancelOrder : this.cancelAllOrder

      action()
        .then(() => {
          this.$toast.success(this.$t('trade.orders_cancelled'))
        })
        .catch(this.$onRejected)
    },

    handleSideClick(side: string | undefined) {
      this.side = side

      this.fetchOrders()
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit
      this.fetchOrders()
    },

    handlePageChangeEvent(page: number) {
      this.page = page
      this.fetchOrders()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.fetchOrders()
    },

    handleClearFilters() {
      this.selectedToken = undefined
      this.side = undefined

      this.fetchOrders()
    }
  }
})
</script>
