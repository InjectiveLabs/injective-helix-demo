<template>
  <tr v-if="market">
    <td class="text-center relative">
      <v-button
        text
        :aqua="position.direction === TradeDirection.Long"
        :red="position.direction === TradeDirection.Short"
        :class="{
          'border border-aqua-500': position.direction === TradeDirection.Long,
          'border border-red-500 ': position.direction === TradeDirection.Short
        }"
        class="flex items-center px-2 py-1"
        @click="onClosePositionClick"
      >
        {{ $t('Close') }}
        <v-icon-close class="w-3 h-3 ml-1 mt-px" />
      </v-button>
    </td>
    <td
      v-if="!isOnMarketPage"
      class="text-left cursor-pointer"
      @click="handleClickOnMarket"
    >
      {{ position.ticker }}
    </td>

    <td class="text-right font-mono">
      <span
        :class="{
          'text-aqua-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
      >
        {{ priceToFormat }}
      </span>
    </td>
    <td class="text-right font-mono">
      {{ quantityToFormat }}
    </td>
    <td class="text-right font-mono">
      {{ liquidationPriceToFormat }}
    </td>
    <td class="text-center">
      <v-badge
        :aqua="position.direction === TradeDirection.Long"
        :red="position.direction === TradeDirection.Short"
        sm
      >
        {{ directionLocalized }}
      </v-badge>
    </td>
    <td class="text-center">
      <div
        v-if="!pnl.isNaN()"
        class="flex items-center justify-end text-xs"
        :class="pnlClass"
      >
        <span class="mr-1">≈</span>
        <div class="flex items-center">
          <span class="mr-1 flex items-center">
            <span>{{ pnl.gte(0) ? '+' : '' }}</span>
            <span
              :class="{
                'text-aqua-500': pnl.gte(0),
                'text-red-500': pnl.lt(0)
              }"
            >
              {{ pnlToFormat }}
            </span>
            <span class="ml-1">{{ market.quoteToken.symbol }}</span>
          </span>
          <span class="flex" style="margin-top: -2px">
            ({{
              (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2)
            }})%
          </span>
        </div>
      </div>
      <span v-else class="text-gray-400">{{ $t('not_available_n_a') }}</span>
    </td>
    <td class="text-right font-mono">
      {{ notionalValueToFormat }}
      <span class="text-2xs text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </td>
    <td class="text-right">
      <div class="flex items-center justify-end h-8">
        <span class="font-mono">
          {{ marginToFormat }}
        </span>
        <button
          role="button"
          type="button"
          class="border border-primary-500 text-primary-500 hover:text-primary-300 ml-2 px-1"
          @click.stop.prevent="onAddMarginButtonClick"
        >
          &plus;
        </button>
      </div>
    </td>
    <td class="text-right font-mono">
      <span
        v-if="effectiveLeverage.gt(0)"
        class="flex items-center justify-end"
      >
        {{ effectiveLeverage.toFormat(2) }}
        <span class="text-gray-300">&times;</span>
      </span>
      <span v-else class="text-gray-400">{{ $t('not_available_n_a') }}</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  UiPosition,
  TradeDirection,
  DerivativeOrderSide,
  UiDerivativeOrderbook,
  UiPriceLevel,
  Icon,
  UiDerivativeLimitOrder,
  UiSpotLimitOrder
} from '~/types'

export default Vue.extend({
  props: {
    position: {
      required: true,
      type: Object as PropType<UiPosition>
    }
  },

  data() {
    return {
      Icon,
      TradeDirection,
      status: new Status()
    }
  },

  computed: {
    currentMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    currentOrderbook(): UiDerivativeOrderbook | undefined {
      return this.$accessor.derivatives.orderbook
    },

    currentOrders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    isOnMarketPage(): boolean {
      return this.$route.name === 'derivatives-derivative'
    },

    markets(): UiDerivativeMarket[] {
      const { isOnMarketPage } = this

      if (isOnMarketPage) {
        return []
      }

      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarket | undefined {
      const { markets, currentMarket, isOnMarketPage, position } = this

      if (isOnMarketPage) {
        return currentMarket
      }

      return markets.find((m) => m.marketId === position.marketId)
    },

    orderbooks(): Record<string, UiDerivativeOrderbook> {
      const { isOnMarketPage } = this

      if (isOnMarketPage) {
        return {}
      }

      return this.$accessor.portfolio.derivativeOrderbooks
    },

    orderbook(): UiDerivativeOrderbook | undefined {
      const { isOnMarketPage, currentOrderbook } = this
      const { orderbooks, position } = this

      if (isOnMarketPage) {
        return currentOrderbook
      }

      return orderbooks[position.marketId]
    },

    orders(): Array<UiDerivativeLimitOrder | UiSpotLimitOrder> {
      const { isOnMarketPage, currentOrders } = this

      if (isOnMarketPage) {
        return currentOrders
      }

      return this.$accessor.portfolio.subaccountOrders
    },

    price(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.entryPrice).toBase(
        market.quoteToken.decimals
      )
    },

    priceToFormat(): string {
      const { market, price } = this

      if (!market) {
        return price.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return price.toFormat(market.priceDecimals)
    },

    margin(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.margin).toBase(
        market.quoteToken.decimals
      )
    },

    marginToFormat(): string {
      const { market, margin } = this

      if (!market) {
        return margin.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return margin.toFormat(market.priceDecimals)
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

    quantity(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(position.quantity)
    },

    quantityToFormat(): string {
      const { market, quantity } = this

      if (!market) {
        return quantity.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return quantity.toFormat(market.quantityDecimals)
    },

    markPrice(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.markPrice).toBase(
        market.quoteToken.decimals
      )
    },

    notionalValue(): BigNumberInBase {
      const { market, quantity, markPrice } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return markPrice.times(quantity)
    },

    notionalValueToFormat(): string {
      const { market, notionalValue } = this

      if (!market) {
        return notionalValue.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return notionalValue.toFormat(market.priceDecimals)
    },

    liquidationPrice(): BigNumberInBase {
      const { position, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const liquidationPrice = new BigNumberInWei(
        position.liquidationPrice
      ).toBase(market.quoteToken.decimals)

      return liquidationPrice.gt(0) ? liquidationPrice : new BigNumberInBase(0)
    },

    liquidationPriceToFormat(): string {
      const { market, liquidationPrice } = this

      if (!market) {
        return liquidationPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return liquidationPrice.toFormat(market.priceDecimals)
    },

    totalReduceOnlyQuantity(): BigNumberInBase {
      const { market, position, orders } = this

      if (!position || !market) {
        return ZERO_IN_BASE
      }

      const reduceOnlyOrders = orders.filter(
        (o) => (o as UiDerivativeLimitOrder).isReduceOnly
      )

      return reduceOnlyOrders.reduce(
        (total, order) => total.plus(order.quantity),
        ZERO_IN_BASE
      )
    },

    bankruptcyPrice(): BigNumberInBase {
      const { market, price, margin, position, quantity } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const isPositionLong = position.direction === TradeDirection.Long
      const unitMargin = new BigNumberInBase(margin).dividedBy(quantity)

      return isPositionLong ? price.minus(unitMargin) : price.plus(unitMargin)
    },

    feeAdjustedBankruptcyPrice(): BigNumberInBase {
      const { bankruptcyPrice, position, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const minTickPrice = new BigNumberInBase(
        new BigNumberInBase(1).shiftedBy(-market.priceDecimals)
      )
      const isPositionLong = position.direction === TradeDirection.Long
      const feeAdjustedBankruptcyPrice = isPositionLong
        ? bankruptcyPrice.dividedBy(
            new BigNumberInBase(1).minus(market.takerFeeRate)
          )
        : bankruptcyPrice.dividedBy(
            new BigNumberInBase(1).plus(market.takerFeeRate)
          )

      return feeAdjustedBankruptcyPrice.gte(0)
        ? feeAdjustedBankruptcyPrice
        : minTickPrice
    },

    pnl(): BigNumberInBase {
      const { market, sells, position, price, buys } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInBase(buy ? buy.price : 0)
      const lowestSell = new BigNumberInBase(sell ? sell.price : 0)
      const executionPrice = new BigNumberInWei(
        highestBuy.plus(lowestSell).div(2)
      ).toBase(market.quoteToken.decimals)

      if (executionPrice.isZero()) {
        return new BigNumberInBase('')
      }

      return new BigNumberInBase(position.quantity)
        .times(executionPrice.minus(price))
        .times(position.direction === TradeDirection.Long ? 1 : -1)
    },

    pnlToFormat(): string {
      const { market, pnl } = this

      if (!market) {
        return pnl.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return pnl.toFormat(market.priceDecimals)
    },

    percentagePnl(): BigNumberInBase {
      const { pnl, market, margin } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (pnl.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(pnl.dividedBy(margin).times(100))
    },

    pnlClass(): string {
      const { pnl } = this

      if (pnl.isNaN()) {
        return ''
      }

      return pnl.gte(0) ? 'text-aqua-500' : 'text-red-500'
    },

    effectiveLeverage(): BigNumberInBase {
      const { pnl, notionalValue, margin, market } = this

      if (!market || margin.lte(0) || notionalValue.lte(0) || pnl.isNaN()) {
        return ZERO_IN_BASE
      }

      const effectiveLeverage = new BigNumberInBase(
        notionalValue.dividedBy(margin.plus(pnl))
      )

      return effectiveLeverage.gt(0)
        ? effectiveLeverage
        : new BigNumberInBase(0)
    },

    notEnoughLiquidityError(): string | undefined {
      const { pnl, market } = this

      if (!market) {
        return
      }

      if (pnl.isNaN()) {
        return this.$t('no_liquidity')
      }

      return undefined
    },

    aggregateReduceOnlyQuantityExceedError(): string | undefined {
      const { totalReduceOnlyQuantity, position } = this

      if (
        totalReduceOnlyQuantity.gt(0) &&
        totalReduceOnlyQuantity.lt(position.quantity)
      ) {
        return this.$t('reduce_only_exceed_position')
      }

      return undefined
    },

    positionCloseError(): string | undefined {
      const {
        notEnoughLiquidityError,
        aggregateReduceOnlyQuantityExceedError,
        market
      } = this

      if (!market) {
        return
      }

      if (notEnoughLiquidityError) {
        return notEnoughLiquidityError
      }

      if (aggregateReduceOnlyQuantityExceedError) {
        return aggregateReduceOnlyQuantityExceedError
      }

      return undefined
    },

    directionLocalized(): string {
      const { position } = this

      return position.direction === TradeDirection.Long
        ? this.$t('long')
        : this.$t('short')
    }
  },

  methods: {
    onAddMarginButtonClick() {
      this.$root.$emit('add-margin-to-position', this.position)
    },

    onClosePositionClick() {
      const { positionCloseError, market } = this

      if (!market) {
        return
      }

      if (positionCloseError) {
        return this.$toast.error(positionCloseError)
      }

      return this.handleClosePosition()
    },

    handleClosePosition() {
      const { position, market, feeAdjustedBankruptcyPrice } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .closePosition({
          market,
          orderType:
            position.direction === TradeDirection.Long
              ? DerivativeOrderSide.Sell
              : DerivativeOrderSide.Buy,
          price: feeAdjustedBankruptcyPrice,
          quantity: new BigNumberInBase(position.quantity)
        })
        .then(() => {
          this.$toast.success(this.$t('position_closed'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleClickOnMarket() {
      const { market } = this

      if (!market) {
        return
      }

      return this.$router.push({
        name: 'derivatives-derivative',
        params: {
          marketId: market.marketId,
          derivative: market.slug
        }
      })
    }
  }
})
</script>
