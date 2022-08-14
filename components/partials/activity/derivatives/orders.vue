<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <VCardTableWrap>
        <template #actions>
          <div class="col-span-12 grid grid-cols-12 gap-4 w-full">
            <SearchAsset
              :markets="markets"
              :value="selectedToken"
              @select="handleSearch"
            />

            <FilterSelector
              class="col-span-4 md:col-span-3 lg:col-span-2"
              data-cy="universal-table-filter-by-side-drop-down"
              :type="TradeSelectorType.Side"
              :value="side"
              @click="handleSideClick"
            />

            <ClearFiltersButton
              v-if="showClearFiltersButton"
              @clear="handleClearFilters"
            />

            <div class="hidden md:block md:col-span-3 lg:col-span-6" />

            <div
              v-if="filteredOrders.length > 0"
              class="col-span-4 md:col-span-3 lg:col-span-2 flex justify-between items-center sm:hidden mt-3 text-xs px-3"
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
              class="col-span-4 md:col-span-3 lg:col-span-2 sm:text-right mt-0 hidden sm:block"
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
          </div>
        </template>

        <!-- mobile table -->
        <TableBody
          :show-empty="filteredOrders.length === 0"
          class="sm:hidden mt-3 max-h-lg overflow-y-auto"
        >
          <MobileOrder
            v-for="(order, index) in filteredOrders"
            :key="`mobile-derivative-orders-${index}-${order.orderHash}`"
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

        <portal to="activity-card-derivative-count">
          <span class="font-semibold text-sm md:text-lg">
            {{ orders.length }}
          </span>
        </portal>

        <portal to="activity-tab-derivative-count">
          <span v-if="status.isNotLoading()"> ({{ orders.length }}) </span>
        </portal>
      </VCardTableWrap>

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
import { stringToDerivativeOrderSide } from '@/components/partials/activity/common/utils'

export default Vue.extend({
  components: {
    Order,
    FilterSelector,
    MobileOrder,
    OrdersTableHeader,
    TableBody,
    Pagination,
    SearchAsset,
    ClearFiltersButton
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
    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredOrders(): UiDerivativeLimitOrder[] {
      const {
        // markets,
        // search,
        orders
        // side
      } = this

      // return orders.filter((o) => {
      //   const market = markets.find((m) => m.marketId === o.marketId)

      //   if (!market) {
      //     return false
      //   }

      //   if (!search && !side) {
      //     return true
      //   }

      //   const isPartOfSearchFilter =
      //     !search ||
      //     market.ticker.toLowerCase().includes(search.trim().toLowerCase())
      //   const isPartOfSideFilter = !side || o.orderSide === side

      //   return isPartOfSearchFilter && isPartOfSideFilter
      // })

      return orders
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
    this.updateOrders().finally(() => {
      this.$root.$emit('derivative-tab-loaded')
    })
  },

  methods: {
    updateOrders(): Promise<void> {
      this.status.setLoading()

      const orderSide = this.side
        ? stringToDerivativeOrderSide(this.side)
        : undefined

      const marketId = this.markets.find((m) => {
        return (
          m.baseToken.symbol === this.selectedToken?.symbol ||
          m.quoteToken.symbol === this.selectedToken?.symbol
        )
      })?.marketId

      const marketIds = this.markets.map((market) => market.marketId)

      return Promise.all([
        this.$accessor.derivatives.fetchSubaccountOrders({
          pagination: {
            skip: (this.page - 1) * this.limit,
            limit: this.limit
          },
          filters: {
            marketId,
            marketIds,
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
      const { filteredOrders } = this

      return this.$accessor.derivatives.batchCancelOrder(filteredOrders)
    },

    cancelOrder(): Promise<void> {
      const { filteredOrders } = this

      const [order] = filteredOrders

      return this.$accessor.derivatives.cancelOrder(order)
    },

    handleCancelOrders() {
      const { filteredOrders } = this

      const action =
        filteredOrders.length === 1 ? this.cancelOrder : this.cancelAllOrder

      action()
        .then(() => {
          this.$toast.success(this.$t('trade.orders_cancelled'))
        })
        .catch(this.$onRejected)
    },

    handleSideClick(side: string | undefined) {
      this.side = side
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit
      this.updateOrders()
    },

    handlePageChangeEvent(page: number) {
      this.page = page
      this.updateOrders()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.updateOrders()
    },

    handleClearFilters() {
      this.selectedToken = undefined
      this.side = undefined

      this.updateOrders()
    }
  }
})
</script>
