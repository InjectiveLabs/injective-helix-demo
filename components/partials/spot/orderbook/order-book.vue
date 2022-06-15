<template>
  <div class="flex flex-col flex-wrap w-full overflow-y-hidden">
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
          <Record
            v-for="(sell, index) in sellsWithDepth"
            :key="`order-book-sell-${sell.aggregatedPrice || sell.price}`"
            :ref="`order-book-sell-${index}`"
            :class="{
              active: sellHoverPosition !== null && index >= sellHoverPosition
            }"
            :position="index"
            :aggregation="aggregation"
            :type="SpotOrderSide.Sell"
            :user-orders="sellUserOrderPrices"
            :record="sell"
            data-cy="orderbook-sell-list-item"
            @update:active-position="handleSellOrderHover"
          ></Record>
        </ul>
      </div>
    </div>
    <div
      v-if="market"
      class="orderbook-middle-h bg-gray-900 flex flex-col items-center justify-center border-t border-b"
    >
      <div class="w-full flex items-center justify-center">
        <IconArrow
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
          data-cy="orderbook-last-traded-price-text-content"
        >
          {{ lastTradedPriceToFormat }}
        </span>
      </div>
    </div>

    <div
      ref="buyOrders"
      class="overflow-y-scroll overflow-x-hidden w-full orderbook-half-h"
    >
      <div class="flex h-full w-full">
        <ul
          ref="buyOrders"
          class="list-order-book w-full mb-auto"
          @mouseenter="autoScrollBuysLocked = true"
          @mouseleave="autoScrollBuysLocked = false"
        >
          <Record
            v-for="(buy, index) in buysWithDepth"
            :key="`order-book-buy-${buy.aggregatedPrice || buy.price}`"
            :ref="`order-book-buy-${index}`"
            :class="{
              active: buyHoverPosition !== null && index <= buyHoverPosition
            }"
            :position="index"
            :aggregation="aggregation"
            :type="SpotOrderSide.Buy"
            :user-orders="buyUserOrderPrices"
            :record="buy"
            data-cy="orderbook-buy-list-item"
            @update:active-position="handleBuyOrderHover"
          ></Record>
        </ul>
      </div>
    </div>

    <!-- orderbook summary popup -->
    <div ref="orderbookSummary" class="orderbook-summary">
      <SummaryPopup :market="market" :summary="orderBookSummary" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { createPopper, Instance } from '@popperjs/core'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  SpotOrderSide,
  UiSpotLimitOrder,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSpotTrade,
  Change,
  UiOrderbookPriceLevel,
  UiPriceLevel,
  UiOrderbookSummary,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import Record from './record.vue'
import SummaryPopup from '~/components/partials/common/orderbook/summary-popup.vue'
import {
  computeOrderbookSummary,
  getAggregationPrice
} from '~/app/client/utils/spot'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    SummaryPopup,
    Record
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
      SpotOrderSide,
      autoScrollSellsLocked: false,
      autoScrollBuysLocked: false,
      buyHoverPosition: null as number | null,
      sellHoverPosition: null as number | null,
      popper: {} as Instance,
      popperOption: {
        placement: 'left',
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              mainAxis: false
            }
          }
        ]
      } as Object
    }
  },

  computed: {
    trades(): UiSpotTrade[] {
      return this.$accessor.spot.trades
    },

    subaccountOrders(): UiSpotLimitOrder[] {
      return this.$accessor.spot.subaccountOrders
    },

    market(): UiSpotMarketWithToken | undefined {
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

    lastTradedPriceToFormat(): string {
      const { market, lastTradedPrice } = this

      if (!market) {
        return lastTradedPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return lastTradedPrice.toFormat(market.priceDecimals)
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

    midOrderbookPrice(): BigNumberInBase {
      const { sells, buys, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInBase(buy ? buy.price : 0)
      const lowestSell = new BigNumberInBase(sell ? sell.price : 0)
      const sum = highestBuy.plus(lowestSell)

      if (sum.lte(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(sum.div(2)).toBase(market.quoteToken.decimals)
    },

    aggregatedBuyOrders(): UiOrderbookPriceLevel[] {
      const { aggregation, buys, market } = this

      if (!market) {
        return []
      }

      const orders = {} as Record<string, any>
      buys.forEach((record: UiPriceLevel) => {
        const price = new BigNumberInBase(
          new BigNumberInBase(record.price).toWei(
            market.baseToken.decimals - market.quoteToken.decimals
          )
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
            aggregatedPrice
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

        const aggregatePrices = orderGroup.map(
          ({ price }: UiPriceLevel) => price
        )

        return {
          ...firstOrder,
          aggregatePrices,
          quantity
        }
      })
    },

    buysTotalNotional(): BigNumberInBase {
      const { aggregatedBuyOrders: buys, midOrderbookPrice, market } = this
      const threshold = new BigNumberInBase(1).minus(
        new BigNumberInBase(20).div(100)
      )

      if (!market) {
        return ZERO_IN_BASE
      }

      const filteredBuys = buys
        .filter((buy) => {
          return new BigNumberInWei(buy.price)
            .toBase(market.quoteToken.decimals)
            .div(midOrderbookPrice)
            .gte(threshold)
        })
        .sort((a, b) => {
          const aNotional = new BigNumberInWei(a.quantity).times(a.price)
          const bNotional = new BigNumberInWei(b.quantity).times(b.price)

          return new BigNumberInBase(bNotional).minus(aNotional).toNumber()
        })

      const [highestNotionalBuy] = filteredBuys

      return highestNotionalBuy
        ? new BigNumberInWei(highestNotionalBuy.quantity)
            .times(highestNotionalBuy.price)
            .toBase(market.quoteToken.decimals)
        : ZERO_IN_BASE
    },

    sellsHighestBaseQuantity(): BigNumberInBase {
      const { aggregatedSellOrders: sells, midOrderbookPrice, market } = this
      const threshold = new BigNumberInBase(1).minus(
        new BigNumberInBase(20).div(100)
      )

      if (!market) {
        return ZERO_IN_BASE
      }

      const filteredSells = sells
        .filter((sell) => {
          return midOrderbookPrice
            .div(
              new BigNumberInWei(sell.price).toBase(market.quoteToken.decimals)
            )
            .gte(threshold)
        })
        .sort((a, b) => {
          return new BigNumberInBase(b.quantity).minus(a.quantity).toNumber()
        })
      const [highestSell] = filteredSells

      return highestSell
        ? new BigNumberInWei(highestSell.quantity).toBase(
            market.baseToken.decimals
          )
        : ZERO_IN_BASE
    },

    aggregatedSellOrders(): UiOrderbookPriceLevel[] {
      const { aggregation, sells, market } = this

      if (!market) {
        return []
      }

      const orders = {} as Record<string, any>
      sells.forEach((record: UiPriceLevel) => {
        const price = new BigNumberInBase(
          new BigNumberInBase(record.price).toWei(
            market.baseToken.decimals - market.quoteToken.decimals
          )
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
            aggregatedPrice
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

          const aggregatePrices = orderGroup.map(
            ({ price }: UiPriceLevel) => price
          )

          return {
            ...firstOrder,
            aggregatePrices,
            quantity
          }
        })
    },

    buysWithDepth(): UiOrderbookPriceLevel[] {
      const { aggregatedBuyOrders, buysTotalNotional, market } = this

      if (!market) {
        return []
      }

      const sortedAggregatedBuyOrders = [...aggregatedBuyOrders].sort(
        (v1: UiOrderbookPriceLevel, v2: UiOrderbookPriceLevel) => {
          const v1Price = new BigNumberInWei(v1.price)
          const v2Price = new BigNumberInWei(v2.price)

          return v2Price.minus(v1Price).toNumber()
        }
      )

      return sortedAggregatedBuyOrders.map((record: UiPriceLevel) => {
        const total = new BigNumberInWei(record.quantity)
          .times(record.price)
          .toBase(market.quoteToken.decimals)

        return {
          ...record,
          total,
          depth: total.dividedBy(buysTotalNotional).times(100).toNumber()
        } as UiOrderbookPriceLevel
      })
    },

    buyOrdersSummary(): UiOrderbookSummary | undefined {
      const { buysWithDepth, buyHoverPosition, market } = this

      if (!market || buysWithDepth.length === 0 || buyHoverPosition === null) {
        return
      }

      const buyOrdersSummary = buysWithDepth
        .slice(0, Number(buyHoverPosition) + 1)
        .reduce(computeOrderbookSummary, {
          quantity: new BigNumberInWei(0),
          total: new BigNumberInBase(0)
        })

      return {
        ...buyOrdersSummary,
        quantity: buyOrdersSummary.quantity.toBase(market.baseToken.decimals)
      }
    },

    sellsWithDepth(): UiOrderbookPriceLevel[] {
      const { aggregatedSellOrders, sellsHighestBaseQuantity, market } = this

      if (!market) {
        return []
      }

      const sortedAggregatedSellOrders = [...aggregatedSellOrders].sort(
        (v1: UiOrderbookPriceLevel, v2: UiOrderbookPriceLevel) => {
          const v1Price = new BigNumberInWei(v1.price)
          const v2Price = new BigNumberInWei(v2.price)

          return v1Price.minus(v2Price).toNumber()
        }
      )

      return sortedAggregatedSellOrders
        .map((record: UiPriceLevel) => {
          const baseQuantity = new BigNumberInWei(record.quantity).toBase(
            market.baseToken.decimals
          )
          const total = new BigNumberInWei(record.quantity)
            .times(record.price)
            .toBase(market.quoteToken.decimals)

          return {
            ...record,
            total,
            depth: baseQuantity
              .dividedBy(sellsHighestBaseQuantity)
              .times(100)
              .toNumber()
          } as UiOrderbookPriceLevel
        })
        .reverse()
    },

    sellOrdersSummary(): UiOrderbookSummary | undefined {
      const { sellsWithDepth, sellHoverPosition, market } = this

      if (
        !market ||
        sellsWithDepth.length === 0 ||
        sellHoverPosition === null
      ) {
        return
      }

      const sellOrdersSummary = sellsWithDepth
        .slice(Number(sellHoverPosition))
        .reduce(computeOrderbookSummary, {
          quantity: new BigNumberInWei(0),
          total: new BigNumberInBase(0)
        })

      return {
        ...sellOrdersSummary,
        quantity: sellOrdersSummary.quantity.toBase(market.baseToken.decimals)
      }
    },

    orderBookSummary(): UiOrderbookSummary | undefined {
      const {
        buyHoverPosition,
        sellHoverPosition,
        buyOrdersSummary,
        sellOrdersSummary
      } = this

      if (buyHoverPosition !== null) {
        return buyOrdersSummary
      }

      if (sellHoverPosition !== null) {
        return sellOrdersSummary
      }

      return undefined
    },

    $orderbookSummaryElement(): InstanceType<typeof HTMLElement> {
      return this.$refs.orderbookSummary as InstanceType<typeof HTMLElement>
    }
  },

  watch: {
    aggregation() {
      this.$nextTick(() => {
        this.onScrollSells()
        this.onScrollBuys()
      })
    },

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
    },

    handleSellOrderHover(position: number | null) {
      const { $orderbookSummaryElement, popperOption } = this
      this.sellHoverPosition = position

      if (position !== null) {
        const hoverElement = this.$refs[`order-book-sell-${position}`] as {
          $el: InstanceType<typeof Element>
        }[]

        this.popper = createPopper(
          hoverElement[0].$el,
          $orderbookSummaryElement,
          popperOption
        )

        this.$nextTick(() =>
          $orderbookSummaryElement.setAttribute('data-show', '')
        )
      } else {
        if (this.popper.destroy) {
          this.popper.destroy()
        }
        $orderbookSummaryElement.removeAttribute('data-show')
      }
    },

    handleBuyOrderHover(position: number | null) {
      const { $orderbookSummaryElement, popperOption } = this
      this.buyHoverPosition = position

      if (position !== null) {
        const hoverElement = this.$refs[`order-book-buy-${position}`] as {
          $el: InstanceType<typeof Element>
        }[]

        this.popper = createPopper(
          hoverElement[0].$el,
          $orderbookSummaryElement,
          popperOption
        )

        this.$nextTick(() =>
          $orderbookSummaryElement.setAttribute('data-show', '')
        )
      } else {
        if (this.popper.destroy) {
          this.popper.destroy()
        }
        $orderbookSummaryElement.removeAttribute('data-show')
      }
    }
  }
})
</script>
