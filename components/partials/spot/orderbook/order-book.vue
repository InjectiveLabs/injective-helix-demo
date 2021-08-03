<template>
  <div class="flex flex-col flex-wrap w-full overflow-y-hidden">
    <ul
      ref="sellOrders"
      class="list-order-book overflow-auto w-full"
      @mouseenter="autoScrollSellsLocked = true"
      @mouseleave="autoScrollSellsLocked = false"
    >
      <v-record-empty
        v-for="(emptyOrder, index) in sellsEmptyCount"
        :key="`order-book-sell-empty-${index}`"
      ></v-record-empty>
      <v-record
        v-for="(sell, index) in sellsWithDepth"
        :key="`order-book-sell-${index}`"
        :type="SpotOrderSide.Sell"
        :user-orders="sellUserOrderPrices"
        :record="sell"
      ></v-record>
    </ul>
    <div
      v-if="market"
      class="
        h-14
        bg-dark-800
        flex flex-col
        items-center
        justify-center
        border-t border-b
      "
    >
      <div class="w-full flex justify-between px-2">
        <span class="text-white font-bold text-sm w-2/3 text-right pr-2">
          <div class="inline-block mr-1">
            <v-ui-icon
              v-if="
                [Change.Increase, Change.Decrease].includes(
                  lastTradedPriceChange
                )
              "
              xs
              :rotate="lastTradedPriceChange === Change.Decrease"
              :aqua="lastTradedPriceChange === Change.Increase"
              :red="lastTradedPriceChange === Change.Decrease"
              :icon="Icon.Arrow"
            />
          </div>
          <div class="inline-block">
            <v-ui-format-order-price
              v-bind="{
                value: lastTradedPrice,
                type:
                  lastTradedPriceChange !== Change.Decrease
                    ? TradeDirection.Buy
                    : TradeDirection.Sell
              }"
              class="flex justify-end"
            />
          </div>
        </span>
        <span class="text-sm w-1/3 text-right pr-2" />
      </div>
    </div>
    <ul
      ref="buyOrders"
      class="list-order-book overflow-auto w-full"
      @mouseenter="autoScrollBuysLocked = true"
      @mouseleave="autoScrollBuysLocked = false"
    >
      <v-record
        v-for="(buy, index) in buysWithDepth"
        :key="`order-book-buy-${index}`"
        :type="SpotOrderSide.Buy"
        :user-orders="buyUserOrderPrices"
        :record="buy"
      ></v-record>
      <v-record-empty
        v-for="(emptyOrder, index) in buysEmptyCount"
        :key="`order-book-buy-empty-${index}`"
      ></v-record-empty>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  BigNumberInBase,
  BigNumber,
  BigNumberInWei
} from '@injectivelabs/utils'
import Record from './record.vue'
import RecordEmpty from './record-empty.vue'
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
import {
  UiSpotTrade,
  UiSpotMarket,
  UiSpotLimitOrder,
  UiPriceLevel,
  UiSpotOrderbook,
  TradeDirection,
  SpotOrderSide,
  UiOrderbookPriceLevel,
  Icon,
  Change
} from '~/types'

export default Vue.extend({
  components: {
    'v-record': Record,
    'v-record-empty': RecordEmpty
  },

  data() {
    return {
      Icon,
      Change,
      TradeDirection,
      SpotOrderSide,
      autoScrollSellsLocked: false,
      autoScrollBuysLocked: false,

      limit: 6
    }
  },

  computed: {
    trades(): UiSpotTrade[] {
      return this.$accessor.spot.trades
    },

    subaccountOrders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    orderbook(): UiSpotOrderbook | undefined {
      return this.$accessor.spot.orderbook
    },

    lastTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    lastTradedPriceChange(): Change {
      return this.$accessor.spot.lastTradedPriceChange
    },

    buys(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.buys
    },

    sells(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.sells
    },

    buyUserOrderPrices(): string[] {
      const { subaccountOrders } = this

      return subaccountOrders.reduce((records, { orderSide, price }) => {
        return orderSide === SpotOrderSide.Buy ? [...records, price] : records
      }, [] as string[])
    },

    sellUserOrderPrices(): string[] {
      const { subaccountOrders } = this

      return subaccountOrders.reduce((records, { orderSide, price }) => {
        return orderSide === SpotOrderSide.Sell ? [...records, price] : records
      }, [] as string[])
    },

    buysTotalNotional(): BigNumberInBase {
      const { buys, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return buys
        .reduce((total, buy) => {
          return total.plus(new BigNumberInWei(buy.quantity).times(buy.price))
        }, ZERO_IN_WEI)
        .toBase(market.quoteToken.decimals)
    },

    sellsTotalNotional(): BigNumberInBase {
      const { market, sells } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return sells
        .reduce((total, sell) => {
          return total.plus(new BigNumberInWei(sell.quantity).times(sell.price))
        }, ZERO_IN_WEI)
        .toBase(market.quoteToken.decimals)
    },

    buysWithDepth(): UiOrderbookPriceLevel[] {
      const { buys, buysTotalNotional, market } = this

      if (!market) {
        return []
      }

      let accumulator = ZERO_IN_BASE
      return buys.map((record: UiPriceLevel, index: number) => {
        const notional = new BigNumberInBase(record.quantity).times(
          record.price
        )

        accumulator = index === 0 ? notional : accumulator.plus(notional)

        return {
          ...record,
          total: accumulator.toFixed(),
          depth: accumulator.dividedBy(buysTotalNotional).times(100).toNumber()
        }
      })
    },

    sellsWithDepth(): UiOrderbookPriceLevel[] {
      const { sells, sellsTotalNotional, market } = this

      if (!market) {
        return []
      }

      let accumulator = ZERO_IN_BASE
      return sells
        .map((record: UiPriceLevel, index: number) => {
          const notional = new BigNumberInBase(record.quantity).times(
            record.price
          )

          accumulator = index === 0 ? notional : accumulator.plus(notional)

          return {
            ...record,
            total: accumulator.toFixed(),
            depth: accumulator
              .dividedBy(sellsTotalNotional)
              .times(100)
              .toNumber()
          }
        })
        .reverse()
    },

    sellsEmptyCount(): any[] {
      const { sells, limit } = this

      const size = Object.keys(sells).length

      return size < limit ? new Array(limit - size) : []
    },

    buysEmptyCount(): any[] {
      const { buys, limit } = this

      const size = Object.keys(buys).length

      return size < limit ? new Array(limit - size) : []
    }
  },

  watch: {
    sells() {
      this.$nextTick(this.onScrollSells)
    },

    buys() {
      this.$nextTick(this.onScrollBuys)
    }
  },

  mounted() {
    this.$root.$on('resized-order-book-panel', this.onResize)

    this.$nextTick(() => {
      this.onResize()
    })

    this.$nextTick(() => {
      this.onScrollSells()
      this.onScrollBuys()
    })
  },

  methods: {
    onResize() {
      const panelContent = this.$el.closest('.v-panel-content') as HTMLElement

      if (!panelContent) {
        return
      }

      const height = panelContent.offsetHeight
      const rowSize = 24
      const middleContextHeight = 56

      const totalContentHeight = new BigNumber(height - middleContextHeight)
      const halftotalContentHeight = totalContentHeight
        .div(2)
        .decimalPlaces(0, BigNumber.ROUND_HALF_CEIL)
        .toNumber()

      this.limit = totalContentHeight
        .div(2)
        .div(rowSize)
        .decimalPlaces(0, BigNumber.ROUND_HALF_CEIL)
        .toNumber()

      const sellOrdersRef = this.$refs.sellOrders as any
      const buyOrdersRef = this.$refs.buyOrders as any

      if (sellOrdersRef && buyOrdersRef) {
        sellOrdersRef.style.height = `${halftotalContentHeight}px`
        buyOrdersRef.style.height = `${halftotalContentHeight}px`
      }
    },

    onScrollSells() {
      const el = this.$refs.sellOrders as any

      if (el && !this.autoScrollSellsLocked) {
        el.scrollTop = el.scrollHeight
      }
    },

    onScrollBuys() {
      const el = this.$refs.buyOrders as any

      if (el && !this.autoScrollBuysLocked) {
        el.scrollTop = 0
      }
    }
  }
})
</script>
