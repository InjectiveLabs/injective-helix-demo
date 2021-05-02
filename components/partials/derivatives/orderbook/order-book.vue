<template>
  <div class="flex flex-col flex-wrap w-full">
    <ul
      ref="shortOrders"
      class="list-order-book flex-1 overflow-auto w-full"
      @mouseenter="autoScrollShortsLocked = true"
      @mouseleave="autoScrollShortsLocked = false"
    >
      <v-record-empty
        v-for="(emptyOrder, index) in shortsEmptyCount"
        :key="`order-book-short-empty-${index}`"
      ></v-record-empty>
      <v-record
        v-for="(short, index) in shortsWithDepth"
        :key="`order-book-short-${index}`"
        :type="DerivativeOrderType.Short"
        :user-orders="sellUserOrderPrices"
        :record="short"
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
                    ? TradeDirection.Long
                    : TradeDirection.Short,
                  decimals: market.maxPriceScaleDecimals
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
      ref="longOrders"
      class="list-order-book flex-1 overflow-auto w-full"
      @mouseenter="autoScrollLongsLocked = true"
      @mouseleave="autoScrollLongsLocked = false"
    >
      <v-record
        v-for="(long, index) in longsWithDepth"
        :key="`order-book-long-${index}`"
        :type="DerivativeOrderType.Long"
        :user-orders="buyUserOrderPrices"
        :record="long"
      ></v-record>
      <v-record-empty
        v-for="(emptyOrder, index) in longsEmptyCount"
        :key="`order-book-long-empty-${index}`"
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
  UiDerivativeTrade,
  UiDerivativeMarket,
  UiDerivativeLimitOrder,
  UiPriceLevel,
  UiDerivativeOrderbook,
  TradeDirection,
  DerivativeOrderType,
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
      DerivativeOrderType,
      autoScrollShortsLocked: false,
      autoScrollLongsLocked: false,

      limit: 6
    }
  },

  computed: {
    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.trades
    },

    subaccountOrders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    orderbook(): UiDerivativeOrderbook | undefined {
      return this.$accessor.derivatives.orderbook
    },

    longs(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.longs
    },

    shorts(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.shorts
    },

    buyUserOrderPrices(): string[] {
      const { subaccountOrders } = this

      return subaccountOrders.reduce((records, { orderType, price }) => {
        return orderType === DerivativeOrderType.Long
          ? [...records, price]
          : records
      }, [] as string[])
    },

    sellUserOrderPrices(): string[] {
      const { subaccountOrders } = this

      return subaccountOrders.reduce((records, { orderType, price }) => {
        return orderType === DerivativeOrderType.Short
          ? [...records, price]
          : records
      }, [] as string[])
    },

    longsTotal(): BigNumberInWei {
      const { longs } = this

      return longs.reduce((total, buy) => {
        return total.plus(buy.quantity)
      }, ZERO_IN_WEI)
    },

    shortsTotal(): BigNumberInWei {
      const { shorts } = this

      return shorts.reduce((total, sell) => {
        return total.plus(sell.quantity)
      }, ZERO_IN_WEI)
    },

    longsWithDepth(): UiOrderbookPriceLevel[] {
      const { longs, longsTotal, market } = this

      if (!market) {
        return []
      }

      let accumulator = ZERO_IN_BASE
      return longs.map((record: UiPriceLevel, index: number) => {
        const quantity = new BigNumberInWei(record.quantity).toBase(
          market.baseToken.decimals
        )

        accumulator = index === 0 ? quantity : accumulator.plus(quantity)

        return {
          ...record,
          sumOfQuantities: accumulator.toFixed(),
          depth: accumulator
            .dividedBy(longsTotal.toBase(market.baseToken.decimals))
            .times(100)
            .toNumber()
        }
      })
    },

    shortsWithDepth(): UiOrderbookPriceLevel[] {
      const { shorts, shortsTotal, market } = this

      if (!market) {
        return []
      }

      let accumulator = ZERO_IN_BASE
      return shorts
        .map((record: UiPriceLevel, index: number) => {
          const quantity = new BigNumberInWei(record.quantity).toBase(
            market.baseToken.decimals
          )

          accumulator = index === 0 ? quantity : accumulator.plus(quantity)

          return {
            ...record,
            sumOfQuantities: accumulator.toFixed(),
            depth: accumulator
              .dividedBy(shortsTotal.toBase(market.baseToken.decimals))
              .times(100)
              .toNumber()
          }
        })
        .reverse()
    },

    shortsEmptyCount(): any[] {
      const { shorts, limit } = this

      const size = Object.keys(shorts).length

      return size < limit ? new Array(limit - size) : []
    },

    longsEmptyCount(): any[] {
      const { longs, limit } = this

      const size = Object.keys(longs).length

      return size < limit ? new Array(limit - size) : []
    },

    hasLastTrade(): boolean {
      return this.trades.length !== 0
    },

    showDirection(): boolean {
      const [lastTrade, priorLastTrade] = this.trades || []
      const lastTradePrice = new BigNumberInBase(
        lastTrade && lastTrade.executionPrice ? lastTrade.executionPrice : 0
      )
      const priorLastTradePrice = new BigNumberInBase(
        priorLastTrade && priorLastTrade.executionPrice
          ? priorLastTrade.executionPrice
          : 0
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

      return lastTrade.tradeDirection === TradeDirection.Long
    },

    lastPrice(): BigNumberInBase {
      const { trades, market } = this
      const [lastTrade] = trades || []

      if (!lastTrade || !market) {
        return ZERO_IN_BASE
      }

      if (!lastTrade.executionPrice) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(lastTrade.executionPrice).toWei(
          market.quoteToken.decimals
        )
      )
    }
  },

  watch: {
    shorts() {
      this.$nextTick(this.onScrollShorts)
    },

    longs() {
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
      const el = this.$refs.shortOrders as any

      if (el && !this.autoScrollShortsLocked) {
        el.scrollTop = el.scrollHeight
      }
    },

    onScrollLongs() {
      const el = this.$refs.longOrders as any

      if (el && !this.autoScrollLongsLocked) {
        el.scrollTop = 0
      }
    }
  }
})
</script>
