<template>
  <div class="flex flex-col flex-wrap w-full">
    <ul
      ref="sellOrders"
      class="list-order-book flex-1 overflow-auto w-full"
      @mouseenter="autoScrollShortsLocked = true"
      @mouseleave="autoScrollShortsLocked = false"
    >
      <v-record-empty
        v-for="(emptyOrder, index) in sellsEmptyCount"
        :key="`order-book-sell-empty-${index}`"
      ></v-record-empty>
      <v-record
        v-for="(sell, index) in sellsWithDepth"
        :key="`order-book-sell-${index}`"
        :type="SpotOrderType.Sell"
        :user-orders="sellUserOrderPrices"
        :record="sell"
      ></v-record>
    </ul>
    <div
      v-if="market"
      class="h-14 bg-dark-800 flex flex-col items-center justify-center border-t border-b"
    >
      <div class="w-full flex justify-between px-2">
        <span class="text-white font-bold text-sm w-2/3 text-right pr-2">
          <template v-if="hasLastTrade">
            <div class="inline-block mr-1">
              <v-ui-icon
                xs
                :rotate="!isLastTradeBuy"
                :primary="isLastTradeBuy"
                :accent="!isLastTradeBuy"
                :icon="$enums.Icon.Arrow"
              />
            </div>
            <div class="inline-block">
              <v-ui-format-order-price
                v-bind="{
                  value: lastPrice,
                  type: isLastTradeBuy
                    ? TradeDirection.Buy
                    : TradeDirection.Sell
                }"
                class="flex justify-end"
              />
            </div>
          </template>
          <div v-else class="inline-block">
            <v-ui-text muted-lg> &mdash; </v-ui-text>
          </div>
        </span>
        <span class="text-sm w-1/3 text-right pr-2" />
      </div>
    </div>
    <ul
      ref="buyOrders"
      class="list-order-book flex-1 overflow-auto w-full"
      @mouseenter="autoScrollLongsLocked = true"
      @mouseleave="autoScrollLongsLocked = false"
    >
      <v-record
        v-for="(buy, index) in buysWithDepth"
        :key="`order-book-buy-${index}`"
        :type="SpotOrderType.Buy"
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
  SpotOrderType,
  UiOrderbookPriceLevel
} from '~/types'

export default Vue.extend({
  components: {
    'v-record': Record,
    'v-record-empty': RecordEmpty
  },

  data() {
    return {
      TradeDirection,
      SpotOrderType,
      autoScrollShortsLocked: false,
      autoScrollLongsLocked: false,

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

      return subaccountOrders.reduce((records, { orderType, price }) => {
        return orderType === SpotOrderType.Buy ? [...records, price] : records
      }, [] as string[])
    },

    sellUserOrderPrices(): string[] {
      const { subaccountOrders } = this

      return subaccountOrders.reduce((records, { orderType, price }) => {
        return orderType === SpotOrderType.Sell ? [...records, price] : records
      }, [] as string[])
    },

    buysTotal(): BigNumberInWei {
      const { buys } = this

      return buys.reduce((total, buy) => {
        return total.plus(buy.quantity)
      }, ZERO_IN_WEI)
    },

    sellsTotal(): BigNumberInWei {
      const { sells } = this

      return sells.reduce((total, sell) => {
        return total.plus(sell.quantity)
      }, ZERO_IN_WEI)
    },

    buysWithDepth(): UiOrderbookPriceLevel[] {
      const { buys, buysTotal, market } = this

      if (!market) {
        return []
      }

      let accumulator = ZERO_IN_BASE
      return buys.map((record: UiPriceLevel, index: number) => {
        const quantity = new BigNumberInWei(record.quantity).toBase(
          market.baseToken.decimals
        )

        accumulator = index === 0 ? quantity : accumulator.plus(quantity)

        return {
          ...record,
          sumOfQuantities: accumulator.toFixed(),
          depth: accumulator
            .dividedBy(buysTotal.toBase(market.baseToken.decimals))
            .times(100)
            .toNumber()
        }
      })
    },

    sellsWithDepth(): UiOrderbookPriceLevel[] {
      const { sells, sellsTotal, market } = this

      if (!market) {
        return []
      }

      let accumulator = ZERO_IN_BASE
      return sells
        .map((record: UiPriceLevel, index: number) => {
          const quantity = new BigNumberInWei(record.quantity).toBase(
            market.baseToken.decimals
          )

          accumulator = index === 0 ? quantity : accumulator.plus(quantity)

          return {
            ...record,
            sumOfQuantities: accumulator.toFixed(),
            depth: accumulator
              .dividedBy(sellsTotal.toBase(market.baseToken.decimals))
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
    },

    hasLastTrade(): boolean {
      return this.trades.length !== 0
    },

    showDirection(): boolean {
      const [lastTrade, priorLastTrade] = this.trades || []
      const lastTradePrice = new BigNumberInBase(
        lastTrade && lastTrade.price ? lastTrade.price : 0
      )
      const priorLastTradePrice = new BigNumberInBase(
        priorLastTrade && priorLastTrade.price ? priorLastTrade.price : 0
      )

      const noChangeSincePriorTradeOrPriorTradeNotExists = lastTradePrice.isEqualTo(
        priorLastTradePrice
      )

      return !noChangeSincePriorTradeOrPriorTradeNotExists
    },

    isLastTradeBuy(): boolean {
      const { showDirection, trades } = this
      const [lastTrade] = trades

      if (!showDirection) {
        return true
      }

      if (!lastTrade) {
        return true
      }

      return lastTrade.tradeDirection === TradeDirection.Buy
    },

    lastPrice(): BigNumberInBase {
      const { trades, market } = this
      const [lastTrade] = trades || []

      if (!lastTrade || !market) {
        return ZERO_IN_BASE
      }

      if (!lastTrade.price) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(lastTrade.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    }
  },

  watch: {
    sells() {
      this.$nextTick(this.onScrollShorts)
    },

    buys() {
      this.$nextTick(this.onScrollLongs)
    }
  },

  mounted() {
    this.$root.$on('resized-order-book-panel', this.onResize)

    this.$nextTick(() => {
      this.onScrollShorts()
      this.onScrollLongs()
      this.onResize()
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

      this.limit = totalContentHeight
        .div(rowSize)
        .div(2)
        .decimalPlaces(0, BigNumber.ROUND_HALF_CEIL)
        .toNumber()
    },

    onScrollShorts() {
      const el = this.$refs.sellOrders as any

      if (el && !this.autoScrollShortsLocked) {
        el.scrollTop = el.scrollHeight
      }
    },

    onScrollLongs() {
      const el = this.$refs.buyOrders as any

      if (el && !this.autoScrollLongsLocked) {
        el.scrollTop = 0
      }
    }
  }
})
</script>
