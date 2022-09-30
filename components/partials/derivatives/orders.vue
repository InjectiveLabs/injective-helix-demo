<template>
  <VCardTableWrap>
    <template #actions>
      <div class="col-span-12 lg:col-span-7 xl:col-span-8 m-4 lg:mx-0">
        <div class="flex items-center justify-between lg:justify-start">
          <VButtonFilter
            v-model="component"
            :option="components.openPositions"
            data-cy="trading-page-open-positions-tab-button"
          >
            <span
              class="uppercase text-xs font-semibold whitespace-nowrap overflow-ellipsis"
            >
              {{ $t('activity.openPositions') }}
              {{ `(${filteredPositions.length})` }}
            </span>
          </VButtonFilter>
          <VSeparator />
          <VButtonFilter
            v-model="component"
            :option="components.openOrders"
            data-cy="trading-page-open-orders-tab-button"
          >
            <span
              class="uppercase text-xs font-semibold whitespace-nowrap overflow-ellipsis"
            >
              {{ $t('activity.openOrders') }}
              {{ `(${filteredOrders.length})` }}
            </span>
          </VButtonFilter>
          <VSeparator />
          <VButtonFilter
            v-model="component"
            :option="components.triggers"
            data-cy="trading-page-triggers-tab-button"
          >
            <span
              class="uppercase text-xs font-semibold whitespace-nowrap overflow-ellipsis"
            >
              {{ $t('activity.triggers') }}
              {{ `(${triggers.length})` }}
            </span>
          </VButtonFilter>
          <VSeparator />
          <VButtonFilter
            v-model="component"
            :option="components.orderHistory"
            data-cy="trading-page-order-history-tab-button"
          >
            <span
              class="uppercase text-xs font-semibold whitespace-nowrap overflow-ellipsis"
            >
              {{ $t('activity.orderHistory') }}
            </span>
          </VButtonFilter>
          <VSeparator />
          <VButtonFilter
            v-model="component"
            :option="components.tradeHistory"
            data-cy="trading-page-trade-history-tab-button"
          >
            <span
              class="uppercase text-xs font-semibold whitespace-nowrap overflow-ellipsis"
            >
              {{ $t('activity.tradeHistory') }}
            </span>
          </VButtonFilter>
        </div>
      </div>

      <div
        class="col-span-12 lg:col-span-5 xl:col-span-4 mx-4 mb-4 flex items-center justify-between lg:justify-end lg:ml-0 lg:mr-2 lg:mt-4"
      >
        <VCheckbox
          v-if="market"
          v-model="currentMarketOnly"
          data-cy="trade-page-filter-by-ticker-checkbox"
          class="lg:mr-4"
        >
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </VCheckbox>
        <VButton
          v-if="showCancelAllButton"
          red-outline
          sm
          data-cy="trade-page-cancel-all-button"
          class="rounded"
          @click.stop="handleCancelAllClick"
        >
          {{ $t('trade.cancelAllOrders') }}
        </VButton>
        <VButton
          v-if="
            component === components.openPositions &&
            filteredPositions.length > 0
          "
          red-outline
          sm
          data-cy="trade-page-cancel-all-button"
          class="rounded"
          @click.stop="handleCloseAllPositionsClick"
        >
          {{ $t('trade.closeAllPositions') }}
        </VButton>
      </div>
    </template>

    <HocLoading :status="status">
      <VCard class="h-full p-2" no-padding>
        <component :is="component" v-if="component" />
      </VCard>
    </HocLoading>
  </VCardTableWrap>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  UiBinaryOptionsMarketWithToken,
  UiDerivativeMarketWithToken,
  UiDerivativeLimitOrder,
  UiPosition,
  MarketType,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import OpenOrders from './orders/index.vue'
import OpenPositions from './positions/index.vue'
import TradeHistory from './trade-history/index.vue'
import OrderHistory from './order-history/index.vue'
import Triggers from './triggers/index.vue'

const components = {
  openOrders: 'OpenOrders',
  openPositions: 'OpenPositions',
  tradeHistory: 'TradeHistory',
  orderHistory: 'OrderHistory',
  triggers: 'Triggers'
}

export default Vue.extend({
  components: {
    TradeHistory,
    OpenOrders,
    OpenPositions,
    OrderHistory,
    Triggers
  },

  data() {
    return {
      currentMarketOnly: false,
      status: new Status(StatusType.Loading),

      components,
      component: components.openOrders
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    binaryOptionsMarkets(): UiBinaryOptionsMarketWithToken[] {
      return this.$accessor.derivatives.binaryOptionsMarkets
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    triggers(): UiDerivativeOrderHistory[] {
      return this.$accessor.derivatives.subaccountConditionalOrders
    },

    orderHistory(): UiDerivativeOrderHistory[] {
      return this.$accessor.derivatives.subaccountOrderHistory
    },

    filteredOrders(): UiDerivativeLimitOrder[] {
      const { market, markets, binaryOptionsMarkets, orders } = this

      if (!market) {
        return []
      }

      return orders.filter((order) => {
        if (market.subType !== MarketType.BinaryOptions) {
          return markets.some((market) => market.marketId === order.marketId)
        }

        return binaryOptionsMarkets.some(
          (market) => market.marketId === order.marketId
        )
      })
    },

    filteredPositions(): UiPosition[] {
      const { market, markets, binaryOptionsMarkets, positions } = this

      if (!market) {
        return []
      }

      const result = positions.filter((position) => {
        return !!markets.find((m) => m.marketId === position.marketId)
      })

      return result.filter((position) => {
        if (market.subType !== MarketType.BinaryOptions) {
          return position
        }

        return binaryOptionsMarkets.some(
          (market) => market.marketId === position.marketId
        )
      })
    },

    showCancelAllButton(): boolean {
      const { component, filteredOrders, triggers } = this

      return (
        (component === components.openOrders && filteredOrders.length > 0) ||
        (component === components.triggers && triggers.length > 0)
      )
    },

    cancelAllAction(): () => Promise<void> {
      const { filteredOrders, triggers, component } = this

      if (component === components.triggers) {
        return triggers.length === 1 ? this.cancelOrder : this.cancelAllOrder
      }

      return filteredOrders.length === 1
        ? this.cancelOrder
        : this.cancelAllOrder
    }
  },

  watch: {
    currentMarketOnly: {
      handler() {
        this.reset()
        this.init()
      },
      immediate: true
    }
  },

  mounted() {
    const { positions, orders } = this

    if (positions.length > 0) {
      this.component = components.openPositions
    } else if (orders.length > 0) {
      this.component = components.openOrders
    }

    this.init()
  },

  methods: {
    reset() {
      Promise.all([
        this.$accessor.positions.cancelSubaccountPositionsStream(),
        this.$accessor.derivatives.cancelSubaccountOrdersStream(),
        this.$accessor.derivatives.cancelSubaccountOrderHistoryStream(),
        this.$accessor.derivatives.cancelSubaccountTradesStream()
      ])
    },

    init() {
      const { currentMarketOnly, market } = this

      this.status.setLoading()

      const fetchOptions = {
        filters: {
          marketId: currentMarketOnly && market ? market.marketId : undefined
        },
        pagination: {
          endTime: 0
        }
      }

      Promise.all([
        this.$accessor.derivatives.fetchSubaccountOrders(fetchOptions),
        this.$accessor.derivatives.fetchSubaccountOrderHistory(fetchOptions),
        this.$accessor.derivatives.fetchSubaccountConditionalOrders(
          fetchOptions
        ),
        this.$accessor.derivatives.fetchSubaccountTrades(fetchOptions),
        this.$accessor.positions.fetchSubaccountPositions(fetchOptions),
        this.$accessor.positions.streamSubaccountPositions(
          fetchOptions.filters.marketId
        ),
        this.$accessor.derivatives.streamSubaccountOrders(
          fetchOptions.filters.marketId
        ),
        this.$accessor.derivatives.streamSubaccountOrderHistory(
          fetchOptions.filters.marketId
        ),
        this.$accessor.derivatives.streamSubaccountTrades(
          fetchOptions.filters.marketId
        )
      ])
        .then(() => {
          //
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    onSelect(component: string) {
      this.component = component
    },

    cancelAllOrder(): Promise<void> {
      const { filteredOrders, triggers, component } = this

      return component === components.triggers
        ? this.$accessor.derivatives.batchCancelOrder(triggers)
        : this.$accessor.derivatives.batchCancelOrder(filteredOrders)
    },

    cancelOrder(): Promise<void> {
      const { filteredOrders, triggers, component } = this

      const [order] =
        component === components.triggers ? triggers : filteredOrders

      return this.$accessor.derivatives.cancelOrder(order)
    },

    handleCancelAllClick() {
      const { cancelAllAction } = this

      cancelAllAction()
        .then(() => {
          this.$toast.success(this.$t('trade.orders_cancelled'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    },

    closeAllPositions(): Promise<void> {
      const { filteredPositions } = this

      return this.$accessor.positions.closeAllPosition(filteredPositions)
    },

    closePosition(): Promise<void> {
      const { filteredPositions, markets } = this

      const [position] = filteredPositions
      const market = markets.find((m) => m.marketId === position.marketId)

      if (!market) {
        return Promise.reject(
          new GeneralException(
            Error(
              this.$t('trade.position_market_not_found', {
                marketId: position.marketId
              })
            )
          )
        )
      }

      return this.$accessor.positions.closePosition({
        position,
        market
      })
    },

    handleCloseAllPositionsClick() {
      const { filteredPositions } = this

      const action =
        filteredPositions.length === 1
          ? this.closePosition
          : this.closeAllPositions

      action()
        .then(() => {
          this.$toast.success(this.$t('trade.positions_closed'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          //
        })
    }
  }
})
</script>
