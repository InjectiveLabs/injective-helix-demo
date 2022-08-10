<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <VCardTableWrap>
        <template #actions>
          <div class="col-span-12 lg:col-span-8 grid grid-cols-5 sm:grid-cols-4 gap-4 w-full">
            <TokenSelector
              class="token-selector__token-only"
              :value="selectedToken"
              :options="supportedTokens"
              :placeholder="'Search asset'"
              :balance="balance"
              dense
              rounded
              show-default-indicator
              @input:token="handleSelectToken"
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
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import {
  BankBalanceWithTokenAndBalance,
  BankBalanceWithTokenAndBalanceInBase,
  SpotOrderSide,
  UiSpotLimitOrder,
  UiSpotMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import Order from '~/components/partials/common/spot/order.vue'
import OrdersTableHeader from '~/components/partials/common/spot/orders-table-header.vue'
import MobileOrder from '~/components/partials/common/spot/mobile-order.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import TokenSelector from '@/components/partials/portfolio/bridge/token-selector/select.vue'

function stringToSpotOrderSide(side: string): SpotOrderSide | undefined {
  switch (side) {
    case 'buy': {
      return SpotOrderSide.Buy
    }
    case 'taker': {
      return SpotOrderSide.Sell
    }
    default: {
      return undefined
    }
  }
}

export default Vue.extend({
  components: {
    Order,
    FilterSelector,
    MobileOrder,
    OrdersTableHeader,
    TableBody,
    Pagination,
    TokenSelector
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
    },

    totalCount(): number {
      return this.$accessor.spot.subaccountOrdersTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    balance(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      const supportedTokens = this.$store.state.activity.supportedTokens

      return supportedTokens.filter(
        (token: BankBalanceWithTokenAndBalance) =>
          !!this.markets.find(
            (market) =>
              market.baseToken.denom === token.denom ||
              market.quoteToken.denom === token.denom
          )
      )
    }
  },

  mounted() {
    this.updateOrders()
      .finally(() => {
        this.$root.$emit('spot-tab-loaded')
      })
  },

  methods: {
    updateOrders(): Promise<void> {
      this.status.setLoading()

      const orderSide = this.side ? stringToSpotOrderSide(this.side) : undefined

      const marketId = this.markets.find(m => {
        return m.baseToken.symbol === this.selectedToken?.symbol || m.quoteToken.symbol === this.selectedToken?.symbol
      })?.marketId

      // const marketIds = this.markets.map(market => market.marketId)

      return Promise.all([
        this.$accessor.spot.fetchSubaccountOrders({
          pagination: {
            skip: (this.page - 1) * this.limit,
            limit: this.limit
          },
          filters: {
            marketId,
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
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.updateOrders()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.updateOrders()
    },

    handleSelectToken(token: Token) {
      this.selectedToken = token

      this.updateOrders()
    }
  }
})
</script>
