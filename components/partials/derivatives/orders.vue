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
            <span class="uppercase text-xs font-semibold">
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
            <span class="uppercase text-xs font-semibold">
              {{ $t('activity.openOrders') }}
              {{ `(${filteredOrders.length})` }}
            </span>
          </VButtonFilter>
          <VSeparator />
          <VButtonFilter
            v-model="component"
            :option="components.tradeHistory"
            data-cy="trading-page-trade-history-tab-button"
          >
            <span class="uppercase text-xs font-semibold">
              {{ $t('activity.tradeHistory') }}
            </span>
          </VButtonFilter>
        </div>
      </div>

      <div
        class="col-span-12 lg:col-span-5 xl:col-span-4 mx-4 mb-4 flex items-center justify-between lg:justify-end lg:ml-0 lg:mr-2 lg:mt-4"
      >
        <VCheckbox v-if="market" v-model="currentMarketOnly" class="lg:mr-4">
          {{ $t('trade.asset_only', { asset: market.ticker }) }}
        </VCheckbox>
        <VButton
          v-if="
            component === components.openOrders && filteredOrders.length > 0
          "
          red-outline
          sm
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
          @click.stop="handleCloseAllPositionsClick"
        >
          {{ $t('trade.closeAllPositions') }}
        </VButton>
      </div>
    </template>

    <HocLoading :status="status">
      <VCard class="h-full">
        <component
          :is="component"
          v-if="component"
          v-bind="{ currentMarketOnly }"
        />
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
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import OpenOrders from './orders/index.vue'
import OpenPositions from './positions/index.vue'
import TradeHistory from './trade-history/index.vue'

const components = {
  orderHistory: '',
  openOrders: 'OpenOrders',
  openPositions: 'OpenPositions',
  tradeHistory: 'TradeHistory'
}

export default Vue.extend({
  components: {
    TradeHistory,
    OpenOrders,
    OpenPositions
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

    currentMarketOrders(): UiDerivativeLimitOrder[] {
      const { market, orders } = this

      return orders.filter((order) => order.marketId === market?.marketId)
    },

    currentMarketPositions(): UiPosition[] {
      const { market, positions } = this

      return positions.filter(
        (position) => position.marketId === market?.marketId
      )
    },

    filteredOrders(): UiDerivativeLimitOrder[] {
      const {
        market,
        markets,
        binaryOptionsMarkets,
        currentMarketOnly,
        orders,
        currentMarketOrders
      } = this

      if (!market) {
        return []
      }

      const filteredOrders = currentMarketOnly ? currentMarketOrders : orders

      return filteredOrders.filter((order) => {
        if (market.subType !== MarketType.BinaryOptions) {
          return markets.some((market) => market.marketId === order.marketId)
        }

        return binaryOptionsMarkets.some(
          (market) => market.marketId === order.marketId
        )
      })
    },

    filteredPositions(): UiPosition[] {
      const {
        market,
        binaryOptionsMarkets,
        currentMarketOnly,
        positions,
        currentMarketPositions
      } = this

      if (!market) {
        return []
      }

      const filteredPositions = currentMarketOnly
        ? currentMarketPositions
        : positions

      return filteredPositions.filter((position) => {
        if (market.subType !== MarketType.BinaryOptions) {
          return position
        }

        return binaryOptionsMarkets.some(
          (market) => market.marketId === position.marketId
        )
      })
    }
  },

  watch: {
    positions(newPositions: UiPosition[], oldPositions: UiPosition[]) {
      if (newPositions.length !== oldPositions.length) {
        this.component = components.openPositions
      }
    }
  },

  mounted() {
    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.derivatives.fetchSubaccountTrades(),
      this.$accessor.positions.fetchSubaccountPositions()
    ])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
        this.onInit()
      })
  },

  methods: {
    onInit() {
      if (this.positions.length > 0) {
        this.component = components.openPositions
      } else if (this.orders.length > 0) {
        this.component = components.openOrders
      }
    },

    onSelect(component: string) {
      this.component = component
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

    handleCancelAllClick() {
      const { filteredOrders } = this

      const action =
        filteredOrders.length === 1 ? this.cancelOrder : this.cancelAllOrder

      action()
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
          new Error(
            this.$t('trade.position_market_not_found', {
              marketId: position.marketId
            })
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
