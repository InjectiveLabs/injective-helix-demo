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
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { GridLayout, GridItem } from 'vue-grid-layout'
import { headTitle } from '~/app/utils/generators'
import MarketPriceChartPanel from '~/components/partials/spot/market/chart.vue'
import MarketPanel from '~/components/partials/spot/market/market.vue'
import MarqueePanel from '~/components/partials/spot/market/marquee.vue'
import ModalTransfer from '~/components/partials/spot/transfer.vue'
import ModalDeposit from '~/components/partials/spot/deposit.vue'
import TradingPanel from '~/components/partials/spot/trading/index.vue'
import BalancePanel from '~/components/partials/spot/balance.vue'
import SubaccountBalancePanel from '~/components/partials/spot/subaccount-balance.vue'
import OrderBookPanel from '~/components/partials/spot/orderbook/index.vue'
import TradesPanel from '~/components/partials/spot/trades/index.vue'
import OrdersPanel from '~/components/partials/spot/orders.vue'
import HOCLoading from '~/components/elements/with-loading.vue'
import { UiSpotMarket, UiSpotMarketTrade } from '~/types'
import { localStorage } from '~/app/singletons/Storage'

const LOCAL_STORAGE_GRID_KEY = 'spot-market-grid-layout'
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
    h: 3,
    minW: 3,
    minH: 3
  },
  {
    i: 'trading-panel',
    x: 0,
    y: 6,
    w: 3,
    h: 10,
    minW: 3,
    minH: 8
  },
  {
    i: 'orders-panel',
    x: 3,
    y: 10,
    w: 6,
    h: 6,
    minW: 6,
    minH: 6
  },
  {
    i: 'trades-panel',
    x: 9,
    y: 10,
    w: 3,
    h: 6,
    minW: 3,
    minH: 6
  }
]

export default Vue.extend({
  components: {
    HOCLoading,
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

    tickerFromRoute(): string {
      const { params } = this.$route

      return params.spot.replace('-', '/')
    },

    marketFromRoute(): UiSpotMarket | undefined {
      const { markets, tickerFromRoute } = this

      return markets.find(
        (m) => m.ticker.toLowerCase() === tickerFromRoute.toLowerCase()
      )
    },

    trades(): UiSpotMarketTrade[] {
      return this.$accessor.spot.trades
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    markets(): UiSpotMarket[] {
      return this.$accessor.spot.markets
    },

    lastTradedPriceToString(): string {
      const { trades, market } = this.$accessor.spot

      if (trades.length === 0 || !market) {
        return `0.00`
      }

      const [trade] = trades
      const tradePrice = new BigNumberInWei(trade.price)

      if (tradePrice.isNaN() || tradePrice.lte(0)) {
        return `0.00`
      }

      return `${tradePrice.toFormat(market.maxPriceScaleDecimals)}`
    }
  },

  watch: {
    lastTradedPriceToString(newPrice: string) {
      const { market } = this

      if (market) {
        document.title = `${newPrice} - ${market.ticker} | ${headTitle}`
      }
    }
  },

  mounted() {
    this.$accessor.spot
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
    this.$accessor.spot.reset()
    document.title = headTitle
    clearInterval(this.interval)
  }
})
</script>
