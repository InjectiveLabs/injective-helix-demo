<template>
  <HOCLoading v-if="market" :key="$route.fullPath" :status="status">
    <div class="h-full w-full">
      <grid-layout
        :layout.sync="grid.layout"
        :col-num="grid.colNum"
        :row-height="grid.rowHeight"
        :is-draggable="grid.isDraggable"
        :is-resizable="grid.isResizable"
        :responsive="grid.responsive"
        :vertical-compact="true"
        :use-css-transforms="true"
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
          drag-allow-from=".v-panel-title"
          @resized="$root.$emit(`resized-${item.i}`)"
        >
          <component :is="item.i" />
        </grid-item>
      </grid-layout>
      <modal-transfer />
      <modal-deposit />
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
import TradingPanel from '~/components/partials/derivatives/trading/index.vue'
import BalancePanel from '~/components/partials/derivatives/balance.vue'
import SubaccountBalancePanel from '~/components/partials/derivatives/subaccount-balance/index.vue'
import OrderBookPanel from '~/components/partials/derivatives/orderbook/index.vue'
import TradesPanel from '~/components/partials/derivatives/trades/index.vue'
import OrdersPanel from '~/components/partials/derivatives/orders.vue'
import PositionsPanel from '~/components/partials/derivatives/positions/index.vue'
import HOCLoading from '~/components/elements/with-loading.vue'
import { UiDerivativeMarket } from '~/types'
import { localStorage } from '~/app/singletons/Storage'

const LOCAL_STORAGE_GRID_KEY = 'derivatives-market-grid-layout'
const GRID_ROW_HEIGHT = 54

const gridLayout = () => [
  { i: 'market-panel', x: 0, y: 0, w: 8, h: 1, minW: 8, maxH: 1 },
  { i: 'marquee-panel', x: 8, y: 0, w: 4, h: 1, minW: 2, maxH: 1 },
  {
    i: 'balance-panel',
    x: 0,
    y: 1,
    w: 3,
    h: 2,
    minW: 3,
    minH: 2
  },
  {
    i: 'market-price-chart-panel',
    x: 3,
    y: 1,
    w: 6,
    h: 9,
    minW: 4,
    minH: 9
  },
  {
    i: 'order-book-panel',
    x: 9,
    y: 1,
    w: 3,
    h: 9,
    minW: 3,
    minH: 9
  },
  {
    i: 'subaccount-balance-panel',
    x: 0,
    y: 3,
    w: 3,
    h: 2,
    minW: 3,
    minH: 2
  },
  {
    i: 'trading-panel',
    x: 0,
    y: 5,
    w: 3,
    h: 12,
    minW: 3,
    minH: 10
  },
  {
    i: 'positions-panel',
    x: 3,
    y: 10,
    w: 6,
    h: 2,
    minW: 6,
    minH: 2
  },
  {
    i: 'orders-panel',
    x: 3,
    y: 10,
    w: 6,
    h: 5,
    minW: 6,
    minH: 5
  },
  {
    i: 'trades-panel',
    x: 9,
    y: 10,
    w: 3,
    h: 7,
    minW: 3,
    minH: 7
  }
]

export default Vue.extend({
  components: {
    HOCLoading,
    BalancePanel,
    TradesPanel,
    OrdersPanel,
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
        layout: gridLayout(),
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
        if (localStorage.has(LOCAL_STORAGE_GRID_KEY)) {
          this.grid.layout = localStorage.get(LOCAL_STORAGE_GRID_KEY) as any
        }
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  beforeDestroy() {
    // localStorage.set(LOCAL_STORAGE_GRID_KEY, this.grid.layout)
    this.$accessor.derivatives.reset()
    clearInterval(this.interval)
  }
})
</script>
