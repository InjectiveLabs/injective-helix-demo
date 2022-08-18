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
            class="min-w-3xs hidden sm:block"
            data-cy="universal-table-filter-by-type-drop-down"
            :type="TradeSelectorType.Type"
            :value="type"
            @click="handleTypeClick"
          />

          <FilterSelector
            class="min-w-3xs hidden sm:block"
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
      </Toolbar>

      <TableWrapper break-md class="mt-4 hidden sm:block">
        <table v-if="orders.length > 0" class="table">
          <OrderHistoryTableHeader />
          <tbody>
            <tr
              is="Order"
              v-for="(order, index) in orders"
              :key="`order-${index}`"
              :order="order"
            ></tr>
          </tbody>
        </table>
        <EmptyList
          v-else
          :message="$t('trade.emptyOrders')"
          data-cy="universal-table-nothing-found"
        />
      </TableWrapper>

      <portal to="activity-tab-derivative-orders-count">
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
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { Token } from '@injectivelabs/token-metadata'
import { UiDerivativeLimitOrder, UiDerivativeMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import Pagination from '~/components/partials/common/pagination.vue'
import SearchAsset from '~/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '~/components/partials/activity/common/clear-filters-button.vue'
import Toolbar from '~/components/partials/activity/common/toolbar.vue'
import Order from '~/components/partials/common/derivatives/order.vue'
import OrderHistoryTableHeader from '~/components/partials/common/derivatives/order-history-table-header.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import { TradeSelectorType } from '~/types'

export default Vue.extend({
  components: {
    Order,
    Toolbar,
    Pagination,
    SearchAsset,
    FilterSelector,
    ClearFiltersButton,
    OrderHistoryTableHeader
  },

  data() {
    return {
      TradeSelectorType,
      type: undefined as string | undefined,
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
      return []
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    totalCount(): number {
      return this.$accessor.derivatives.subaccountTradesTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken || !!this.type || !!this.side
    }
  },

  mounted() {
    this.fetchOrderHistory()
  },

  methods: {
    fetchOrderHistory() {
      // TODO: Implement this.
      this.status.setIdle()
    },

    handleSideClick(side: string | undefined) {
      this.side = side

      this.fetchOrderHistory()
    },

    handleTypeClick(type: string | undefined) {
      this.type = type

      this.fetchOrderHistory()
    },
    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.fetchOrderHistory()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.fetchOrderHistory()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.fetchOrderHistory()
    },

    handleClearFilters() {
      this.selectedToken = undefined
      this.side = undefined
      this.type = undefined

      this.fetchOrderHistory()
    }
  }
})
</script>
