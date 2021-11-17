<template>
  <div class="flex flex-col flex-wrap overflow-y-hidden w-full">
    <div
      ref="sellOrders"
      class="overflow-y-scroll overflow-x-hidden w-full orderbook-half-h"
    >
      <div class="flex h-full w-full">
        <ul
          class="list-order-book w-full mt-auto"
          @mouseenter="autoScrollSellsLocked = true"
          @mouseleave="autoScrollSellsLocked = false"
        >
          <v-record
            v-for="(sell, index) in sellsWithDepth"
            :key="`order-book-sell-${index}`"
            :aggregation="aggregation"
            :type="DerivativeOrderSide.Sell"
            :user-orders="sellUserOrderPrices"
            :record="sell"
          ></v-record>
        </ul>
      </div>
    </div>
    <div
      v-if="market"
      class="orderbook-middle-h bg-gray-900 flex flex-col items-center justify-center border-t border-b"
    >
      <div class="w-full flex items-center justify-center">
        <v-icon-arrow
          v-if="
            [Change.Increase, Change.Decrease].includes(lastTradedPriceChange)
          "
          class="transform w-3 h-3 lg:w-4 lg:h-4 4xl:w-5 4xl:h-5"
          :class="{
            'text-red-500 -rotate-90':
              lastTradedPriceChange === Change.Decrease,
            'text-aqua-500 rotate-90': lastTradedPriceChange === Change.Increase
          }"
        />
        <span
          :class="{
            'text-red-500': lastTradedPriceChange === Change.Decrease,
            'text-aqua-500': lastTradedPriceChange !== Change.Decrease
          }"
          class="font-bold font-mono text-base lg:text-lg 4xl:text-xl"
        >
          {{ lastTradedPriceToFormat }}
        </span>
      </div>
    </div>
    <ul
      ref="buyOrders"
      class="list-order-book overflow-y-scroll overflow-x-hidden w-full orderbook-half-h rounded-b-lg"
      @mouseenter="autoScrollBuysLocked = true"
      @mouseleave="autoScrollBuysLocked = false"
    >
      <v-record
        v-for="(buy, index) in buysWithDepth"
        :key="`order-book-buy-${index}`"
        :aggregation="aggregation"
        :type="DerivativeOrderSide.Buy"
        :user-orders="buyUserOrderPrices"
        :record="buy"
      ></v-record>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import Record from './record.vue'
import { getAggregationPrice } from '~/app/services/derivatives'
import {
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  UiDerivativeTrade,
  UiDerivativeMarket,
  UiDerivativeLimitOrder,
  UiPriceLevel,
  UiDerivativeOrderbook,
  TradeDirection,
  DerivativeOrderSide,
  UiOrderbookPriceLevel,
  Change
} from '~/types'

export default Vue.extend({
  components: {
    'v-record': Record
  },

  props: {
    aggregation: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      Change,
      TradeDirection,
      DerivativeOrderSide,
      autoScrollSellsLocked: false,
      autoScrollBuysLocked: false
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

    lastTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    lastTradedPriceChange(): Change {
      return this.$accessor.derivatives.lastTradedPriceChange
    },

    lastTradedPriceToFormat(): string {
      const { market, lastTradedPrice } = this

      if (!market) {
        return lastTradedPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return lastTradedPrice.toFormat(market.priceDecimals)
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
        return orderSide === DerivativeOrderSide.Buy
          ? [...records, price]
          : records
      }, [] as string[])
    },

    sellUserOrderPrices(): string[] {
      const { subaccountOrders } = this

      return subaccountOrders.reduce((records, { orderSide, price }) => {
        return orderSide === DerivativeOrderSide.Sell
          ? [...records, price]
          : records
      }, [] as string[])
    },

    buysTotalNotional(): BigNumberInBase {
      const { buys, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return buys.reduce((total, buy) => {
        return total.plus(
          new BigNumberInWei(buy.quantity)
            .times(buy.price)
            .toBase(market.quoteToken.decimals)
        )
      }, ZERO_IN_BASE)
    },

    sellsTotalNotional(): BigNumberInBase {
      const { sells, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return sells.reduce((total, sell) => {
        return total.plus(
          new BigNumberInWei(sell.quantity)
            .times(sell.price)
            .toBase(market.quoteToken.decimals)
        )
      }, ZERO_IN_BASE)
    },

    aggregatedBuyOrders(): UiOrderbookPriceLevel[] {
      const { aggregation, buys, market } = this

      if (!market) {
        return []
      }

      const orders = {} as Record<string, any>
      buys.forEach((record: UiPriceLevel) => {
        const price = new BigNumberInBase(
          new BigNumberInWei(record.price).toBase(market.quoteToken.decimals)
        )

        const aggregatedPrice = getAggregationPrice({
          price,
          aggregation,
          isBuy: true
        })
        const aggregatedPriceKey = aggregatedPrice.toFormat()

        orders[aggregatedPriceKey] = [
          ...(orders[aggregatedPriceKey] || []),
          {
            ...record,
            displayPrice: aggregatedPrice
          }
        ]
      })

      return Object.entries(orders).map(([, orderGroup]) => {
        const [firstOrder] = orderGroup

        const quantity = orderGroup.reduce(
          (sum: BigNumberInWei, order: UiPriceLevel) => {
            return sum.plus(new BigNumberInWei(order.quantity))
          },
          new BigNumberInWei(0)
        )

        const notional = orderGroup.reduce(
          (sum: BigNumberInWei, order: UiPriceLevel) => {
            const notional = new BigNumberInWei(order.quantity)
              .times(order.price)
              .toBase(market.quoteToken.decimals)

            return sum.plus(notional)
          },
          new BigNumberInBase(0)
        )

        const aggregatePrices = orderGroup.map(
          ({ price }: UiPriceLevel) => price
        )

        return {
          ...firstOrder,
          aggregatePrices,
          notional,
          quantity
        }
      })
    },

    buysWithDepth(): UiOrderbookPriceLevel[] {
      const { aggregatedBuyOrders, buysTotalNotional } = this

      let accumulator = ZERO_IN_BASE

      return aggregatedBuyOrders
        .sort((v1: UiOrderbookPriceLevel, v2: UiOrderbookPriceLevel) => {
          const v1Price = new BigNumberInWei(v1.price)
          const v2Price = new BigNumberInWei(v2.price)

          return v2Price.minus(v1Price).toNumber()
        })
        .map((record: UiPriceLevel, index: number) => {
          const notional = record.notional || new BigNumberInBase(0)

          accumulator = index === 0 ? notional : accumulator.plus(notional)

          return {
            ...record,
            total: accumulator.toFixed(),
            depth: accumulator
              .dividedBy(buysTotalNotional)
              .times(100)
              .toNumber()
          }
        })
    },

    aggregatedSellOrders(): UiOrderbookPriceLevel[] {
      const { aggregation, sells, market } = this

      if (!market) {
        return []
      }

      const orders = {} as Record<string, any>
      sells.forEach((record: UiPriceLevel, index: number) => {
        const price = new BigNumberInBase(
          new BigNumberInWei(record.price).toBase(market.quoteToken.decimals)
        )

        const aggregatedPrice = getAggregationPrice({
          price,
          aggregation,
          isBuy: false
        })
        const aggregatedPriceKey = aggregatedPrice.toFormat()

        orders[aggregatedPriceKey] = [
          ...(orders[aggregatedPriceKey] || []),
          {
            ...record,
            displayPrice: aggregatedPrice
          }
        ]
      })

      return Object.entries(orders)
        .reverse()
        .map(([, orderGroup]) => {
          const [firstOrder] = orderGroup

          const quantity = orderGroup.reduce(
            (sum: BigNumberInWei, order: UiPriceLevel) => {
              return sum.plus(new BigNumberInWei(order.quantity))
            },
            new BigNumberInWei(0)
          )

          const notional = orderGroup.reduce(
            (sum: BigNumberInWei, order: UiPriceLevel) => {
              const notional = new BigNumberInWei(order.quantity)
                .times(order.price)
                .toBase(market.quoteToken.decimals)

              return sum.plus(notional)
            },
            new BigNumberInBase(0)
          )

          const aggregatePrices = orderGroup.map(
            ({ price }: UiPriceLevel) => price
          )

          return {
            ...firstOrder,
            aggregatePrices,
            notional,
            quantity
          }
        })
    },

    sellsWithDepth(): UiOrderbookPriceLevel[] {
      const { aggregatedSellOrders, sellsTotalNotional } = this

      let accumulator = ZERO_IN_BASE

      return aggregatedSellOrders
        .sort((v1: UiOrderbookPriceLevel, v2: UiOrderbookPriceLevel) => {
          const v1Price = new BigNumberInWei(v1.price)
          const v2Price = new BigNumberInWei(v2.price)

          return v1Price.minus(v2Price).toNumber()
        })
        .map((record: UiPriceLevel, index: number) => {
          const notional = record.notional || new BigNumberInBase(0)

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
    this.$nextTick(() => {
      this.onScrollSells()
      this.onScrollBuys()
    })
  },

  methods: {
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
