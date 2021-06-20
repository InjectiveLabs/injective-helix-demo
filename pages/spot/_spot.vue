<template>
  <HOCLoading v-if="market" :key="$route.fullPath" :status="status">
    <div class="h-full w-full">
      <grid-layout
        :layout="layout"
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
          :is-draggable="item.isDraggable"
          :is-resizable="item.isResizable"
          :h="item.h"
          :i="item.i"
          drag-allow-from=".v-panel-title"
          @resized="$root.$emit(`resized-${item.i}`)"
        >
          <component :is="item.i" />
        </grid-item>
      </grid-layout>
      <modal-transfer />
      <modal-deposit />
      <modal-withdraw />
    </div>
  </HOCLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { GridLayout, GridItem } from 'vue-grid-layout'
import MarketPriceChartPanel from '~/components/partials/spot/market/chart.vue'
import MarketPanel from '~/components/partials/spot/market/market.vue'
import MarqueePanel from '~/components/partials/spot/market/marquee.vue'
import ModalTransfer from '~/components/partials/spot/transfer.vue'
import ModalDeposit from '~/components/partials/spot/deposit.vue'
import ModalWithdraw from '~/components/partials/spot/withdraw.vue'
import TradingPanel from '~/components/partials/spot/trading/index.vue'
import BalancePanel from '~/components/partials/spot/balance.vue'
import SubaccountBalancePanel from '~/components/partials/spot/subaccount-balance/index.vue'
import OrderBookPanel from '~/components/partials/spot/orderbook/index.vue'
import TradesPanel from '~/components/partials/spot/trades/index.vue'
import OrdersPanel from '~/components/partials/spot/orders.vue'
import HOCLoading from '~/components/elements/with-loading.vue'
import { UiSpotMarket, Breakpoint } from '~/types'
import { gridLayouts } from '~/components/partials/spot/grid'

const GRID_ROW_HEIGHT = 54

export default Vue.extend({
  components: {
    HOCLoading,
    ModalWithdraw,
    BalancePanel,
    TradesPanel,
    OrdersPanel,
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
        // colNum: 12,
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

      return params.spot
    },

    marketFromRoute(): UiSpotMarket | undefined {
      const { markets, slugFromRoute } = this

      return markets.find(
        (m) => m.slug.toLowerCase() === slugFromRoute.toLowerCase()
      )
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    }
  },

  mounted() {
    this.$accessor.spot
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
    this.$accessor.spot.reset()
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
