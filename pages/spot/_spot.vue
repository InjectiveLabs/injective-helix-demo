<template>
  <HOCLoading v-if="market" :key="$route.fullPath" :status="status">
    <div class="h-full w-full flex flex-wrap py-4">
      <div class="w-full px-4 mb-4">
        <div class="flex flex-wrap -mx-2">
          <div class="w-full lg:w-3/4 3xl:w-4/5 px-2">
            <market-panel />
          </div>
          <div class="hidden lg:block lg:w-1/4 3xl:w-1/5 px-2">
            <marquee-panel />
          </div>
        </div>
      </div>

      <div class="w-full px-4">
        <div class="flex flex-wrap -mx-2">
          <aside class="w-full mb-4 lg:mb-0 lg:w-1/4 3xl:w-1/5 px-2">
            <div class="flex flex-col h-full">
              <div class="w-full flex flex-wrap">
                <div class="mb-4 w-full">
                  <balance-panel />
                </div>
              </div>
              <div class="flex-grow flex-1">
                <trading-panel />
              </div>
            </div>
          </aside>

          <section
            class="w-full flex flex-col flex-wrap lg:w-1/2 3xl:w-3/5 px-2"
          >
            <div class="w-full flex flex-col flex-wrap min-h-screen">
              <div class="mb-4 w-full">
                <market-price-chart-panel />
              </div>
              <div class="mb-4 lg:mb-0 w-full overflow-hidden">
                <orders-panel />
              </div>
            </div>
          </section>

          <aside class="w-full lg:w-1/4 3xl:w-1/5 px-2">
            <div class="flex flex-col min-h-screen">
              <div class="mb-4 w-full">
                <order-book-panel />
              </div>
              <div class="w-full mb-4 lg:mb-0">
                <trades-panel />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </HOCLoading>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei, Status, StatusType } from '@injectivelabs/utils'
import { headTitle } from '~/app/utils/generators'
import MarketPriceChartPanel from '~/components/partials/spot/market/chart.vue'
import MarketPanel from '~/components/partials/spot/market/market.vue'
import MarqueePanel from '~/components/partials/spot/market/marquee.vue'
/*
import ModalDeposit from '~/components/partials/spot/deposit.vue'
*/
import TradingPanel from '~/components/partials/spot/trading/index.vue'
import BalancePanel from '~/components/partials/spot/balance.vue'
import OrderBookPanel from '~/components/partials/spot/orderbook/index.vue'
import TradesPanel from '~/components/partials/spot/trades/index.vue'
import OrdersPanel from '~/components/partials/spot/orders.vue'
import HOCLoading from '~/components/elements/with-loading.vue'
import { UiSpotMarket, UiSpotMarketTrade } from '~/types'

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
    MarketPriceChartPanel
    /*
    ModalDeposit,
    */
  },

  data() {
    return {
      status: new Status(StatusType.Loading),
      interval: 0 as any
    }
  },

  computed: {
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

  mounted() {
    const { marketFromRoute } = this

    if (!marketFromRoute) {
      throw new Error('Market not found')
    }

    this.$accessor.spot
      .changeMarket(marketFromRoute)
      .then(() => {
        //
      })
      .catch(this.$onRejected)
      .finally(() => {
        this.status.setIdle()
      })
  },

  watch: {
    lastTradedPriceToString(newPrice: string) {
      const { market } = this

      if (market) {
        document.title = `${newPrice} - ${market.ticker} | ${headTitle}`
      }
    }
  },

  beforeDestroy() {
    this.$accessor.spot.resetMarket()
    document.title = headTitle
    clearInterval(this.interval)
  }
})
</script>
