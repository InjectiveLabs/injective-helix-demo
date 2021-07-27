<template>
  <HOCLoading v-if="market" :key="$route.fullPath" :status="status">
    <div class="h-full w-full">
      <grid-layout
        :layout="layout"
        :col-num="grid.colNum"
        :row-height="grid.rowHeight"
        :is-draggable="grid.isDraggable"
        :is-resizable="grid.isResizable"
        :responsive="grid.responsive"
        :vertical-compact="true"
        :use-css-transforms="true"
        @breakpoint-changed="handleBreakpointChanged"
      >
        <grid-item
          v-for="item in grid.layout"
          :key="`grid-item-${item.i}`"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :min-w="item.minW"
          :min-h="item.minH"
          :max-h="item.maxH"
          :h="item.h"
          :i="item.i"
          :is-draggable="item.isDraggable"
          :is-resizable="item.isResizable"
          drag-allow-from=".v-panel-title"
          @resized="$root.$emit(`resized-${item.i}`)"
        >
          <component :is="item.i" />
        </grid-item>
      </grid-layout>
      <modal-transfer />
      <modal-deposit />
      <modal-withdraw />
      <modal-take-out />
      <modal-add-margin />
    </div>
  </HOCLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { GridLayout, GridItem } from 'vue-grid-layout'
import MarketPriceChartPanel from '~/components/partials/derivatives/market/chart.vue'
import MarketPanel from '~/components/partials/derivatives/market/market.vue'
import MarqueePanel from '~/components/partials/derivatives/market/marquee.vue'
import ModalTransfer from '~/components/partials/derivatives/transfer.vue'
import ModalDeposit from '~/components/partials/derivatives/deposit.vue'
import ModalTakeOut from '~/components/partials/derivatives/take-out.vue'
import ModalAddMargin from '~/components/partials/derivatives/positions/add-margin/index.vue'
import ModalWithdraw from '~/components/partials/derivatives/withdraw.vue'
import TradingPanel from '~/components/partials/derivatives/trading/index.vue'
import BalancePanel from '~/components/partials/derivatives/balance.vue'
import SubaccountBalancePanel from '~/components/partials/derivatives/subaccount-balance/index.vue'
import OrderBookPanel from '~/components/partials/derivatives/orderbook/index.vue'
import TradesPanel from '~/components/partials/derivatives/trades/index.vue'
import OrdersPanel from '~/components/partials/derivatives/orders.vue'
import PositionsPanel from '~/components/partials/derivatives/positions/index.vue'
import HOCLoading from '~/components/elements/with-loading.vue'
import { UiDerivativeMarket, Breakpoint } from '~/types'
import { gridLayouts } from '~/components/partials/derivatives/grid'

const GRID_ROW_HEIGHT = 54

export default Vue.extend({
  components: {
    HOCLoading,
    ModalAddMargin,
    BalancePanel,
    TradesPanel,
    ModalTakeOut,
    OrdersPanel,
    ModalWithdraw,
    PositionsPanel,
    OrderBookPanel,
    TradingPanel,
    MarketPanel,
    MarqueePanel,
    MarketPriceChartPanel,
    GridLayout,
    GridItem,
    ModalTransfer,
    ModalDeposit,
    SubaccountBalancePanel
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: 0 as any,

      grid: {
        layout: gridLayouts(Breakpoint.Lg),
        colNum: 12,
        rowHeight: GRID_ROW_HEIGHT,
        margin: [16, 16],
        isDraggable: true,
        isResizable: true,
        autoSize: true,
        responsive: true
      }
    }
  },

  computed: {
    layout(): any {
      return this.grid.layout
    },

    slugFromRoute(): string {
      const { params } = this.$route

      return params.derivative
    },

    marketFromRoute(): UiDerivativeMarket | undefined {
      const { markets, slugFromRoute } = this

      return markets.find(
        (m) => m.slug.toLowerCase() === slugFromRoute.toLowerCase()
      )
    },

    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    markets(): UiDerivativeMarket[] {
      return this.$accessor.derivatives.markets
    }
  },

  mounted() {
    this.$accessor.derivatives
      .changeMarket(this.marketFromRoute)
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    this.$accessor.derivatives.reset()
    clearInterval(this.interval)
  },

  methods: {
    handleBreakpointChanged(newBreakpoint: Breakpoint) {
      this.grid.layout = gridLayouts(newBreakpoint)
      this.$nextTick(() => {
        this.grid.layout.forEach((gridItem) => {
          this.$root.$emit(`resized-${gridItem.i}`)
        })
      })
    }
  }
})
</script>
