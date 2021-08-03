<template>
  <tr v-if="market">
    <td is="v-ui-table-td" xs class="relative" center>
      <v-ui-button :status="status" xs @click="onClosePositionClick">
        <v-ui-icon
          :icon="Icon.CloseCircle"
          :tooltip="$t('close_position')"
          sm
          red
          pointer
        ></v-ui-icon>
      </v-ui-button>
    </td>
    <td is="v-ui-table-td" xs center>
      <v-ui-badge
        :aqua="position.direction === TradeDirection.Long"
        :red="position.direction === TradeDirection.Short"
        sm
      >
        <div class="w-10">
          {{ directionLocalized }}
        </div>
      </v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.quantityDecimals
        }"
        class="block"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-price
        v-bind="{
          value: price,
          decimals: market.priceDecimals
        }"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-price
        v-bind="{
          value: liquidationPrice,
          decimals: market.priceDecimals
        }"
      />
    </td>
    <td is="v-ui-table-td" xs center>
      <div
        v-if="!pnl.isNaN()"
        class="flex items-center justify-center text-2xs"
        :class="pnlClass"
      >
        <span class="mr-1">≈</span>
        <div class="flex items-center">
          <span class="mr-1 flex items-center">
            <span>{{ pnl.gte(0) ? '+' : '-' }}</span>
            <v-ui-format-price
              v-bind="{
                value: pnl,
                class: pnlClass,
                decimals: market.priceDecimals
              }"
              class="text-right block"
            /><span class="ml-1">{{ market.quoteToken.symbol }}</span></span
          >
          <span class="flex" style="margin-top: -2px"
            >(<v-ui-format-percent
              v-bind="{
                appendPlusSign: true,
                precision: 2,
                value: percentagePnl.toString()
              }"
            />)</span
          >
        </div>
      </div>
      <v-ui-text v-else muted>{{ $t('not_available_n_a') }}</v-ui-text>
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-price
        v-bind="{
          value: notionalValue,
          decimals: market.priceDecimals
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <div class="flex items-center">
        <v-ui-text>
          <v-ui-format-price
            v-bind="{
              value: margin,
              decimals: market.priceDecimals
            }"
          />
        </v-ui-text>
        <button
          role="button"
          type="button"
          class="
            border border-primary-500
            text-primary-500
            hover:text-primary-300
            ml-2
            px-1
          "
          @click.stop.prevent="onAddMarginButtonClick"
        >
          &plus;
        </button>
      </div>
    </td>
    <td is="v-ui-table-td" xs right>
      <span v-if="effectiveLeverage.gt(0)" class="whitespace-pre">
        <v-ui-format-amount
          emp
          v-bind="{
            value: effectiveLeverage,
            decimals: 2
          }"
          class="inline-block -mr-1"
        />
        <v-ui-text muted>&times;</v-ui-text>
      </span>
      <v-ui-text v-else muted>{{ $t('not_available_n_a') }}</v-ui-text>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_MAX_SLIPPAGE, ZERO_IN_BASE } from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  UiPosition,
  TradeDirection,
  DerivativeOrderSide,
  UiDerivativeOrderbook,
  UiPriceLevel,
  Icon,
  UiDerivativeLimitOrder
} from '~/types'
import { calculateWorstExecutionPriceFromOrderbook } from '~/app/services/derivatives'

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
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    orderbook(): UiDerivativeOrderbook | undefined {
      return this.$accessor.derivatives.orderbook
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
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

    margin(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.margin).toBase(
        market.quoteToken.decimals
      )
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

    liquidationPrice(): BigNumberInBase {
      const { position, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const liquidationPrice = new BigNumberInWei(
        position.liquidationPrice
      ).toBase(market.quoteToken.decimals)

      return liquidationPrice.gt(0)
        ? liquidationPrice
        : new BigNumberInBase(0.01)
    },

    slippage(): BigNumberInBase {
      const { position } = this

      return new BigNumberInBase(
        position.direction === TradeDirection.Long
          ? DEFAULT_MAX_SLIPPAGE.div(100).minus(1).times(-1)
          : DEFAULT_MAX_SLIPPAGE.div(100).plus(1)
      )
    },

    executionPrice(): BigNumberInBase {
      const { sells, slippage, buys, market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const records = position.direction === TradeDirection.Long ? buys : sells

      const worstPrice = calculateWorstExecutionPriceFromOrderbook({
        records,
        market,
        amount: new BigNumberInBase(position.quantity)
      })

      return new BigNumberInBase(
        worstPrice.times(slippage).toFixed(market.priceDecimals)
      )
    },

    totalReduceOnlyQuantity(): BigNumberInBase {
      const { market, position, orders } = this

      if (!position || !market) {
        return ZERO_IN_BASE
      }

      const reduceOnlyOrders = orders.filter((o) => o.isReduceOnly)

      return reduceOnlyOrders.reduce(
        (total, order) => total.plus(order.quantity),
        ZERO_IN_BASE
      )
    },

    bankruptcyPrice(): BigNumberInBase {
      const { market, price, margin, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return price.plus(
        new BigNumberInBase(margin)
          .dividedBy(position.quantity)
          .times(position.direction === TradeDirection.Long ? 1 : -1)
      )
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

      return pnl.gte(0) ? 'text-primary-500' : 'text-red-500'
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
        : new BigNumberInBase(0.01)
    },

    notEnoughtLiqudityError(): string | undefined {
      const { pnl, market } = this

      if (!market) {
        return
      }

      if (pnl.isNaN()) {
        return this.$t('no_liquidity')
      }

      return undefined
    },

    autoLiquidationOnCloseError(): string | undefined {
      const { liquidationPrice, executionPrice, market, position } = this

      if (!market) {
        return
      }

      const isPositionLong = position.direction === TradeDirection.Long

      if (isPositionLong && executionPrice.lte(liquidationPrice)) {
        return this.$t('close_auto_liquidation')
      }

      if (!isPositionLong && executionPrice.gte(liquidationPrice)) {
        return this.$t('close_auto_liquidation')
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

    executionPriceSurpassesBankruptcyPrice(): string | undefined {
      const { executionPrice, market, position, bankruptcyPrice } = this

      if (!market) {
        return
      }

      const isPositionLong = position.direction === TradeDirection.Long
      const divisor = isPositionLong
        ? new BigNumberInBase(1).minus(market.takerFeeRate)
        : new BigNumberInBase(1).plus(market.takerFeeRate)
      const condition = bankruptcyPrice.dividedBy(divisor)

      if (isPositionLong && executionPrice.gt(condition)) {
        return this.$t('execution_price_surpasses_bankruptcy_price')
      }

      if (!isPositionLong && executionPrice.lt(condition)) {
        return this.$t('execution_price_surpasses_bankruptcy_price')
      }

      return undefined
    },

    positionCloseError(): string | undefined {
      const {
        executionPriceSurpassesBankruptcyPrice,
        notEnoughtLiqudityError,
        autoLiquidationOnCloseError,
        aggregateReduceOnlyQuantityExceedError,
        market
      } = this

      if (!market) {
        return
      }

      if (notEnoughtLiqudityError) {
        return notEnoughtLiqudityError
      }

      if (autoLiquidationOnCloseError) {
        return autoLiquidationOnCloseError
      }

      if (aggregateReduceOnlyQuantityExceedError) {
        return aggregateReduceOnlyQuantityExceedError
      }

      if (executionPriceSurpassesBankruptcyPrice) {
        return executionPriceSurpassesBankruptcyPrice
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
      const { position, positionCloseError, executionPrice, market } = this

      if (!market) {
        return
      }

      if (positionCloseError) {
        return this.$toast.error(positionCloseError)
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .closePosition({
          orderType:
            position.direction === TradeDirection.Long
              ? DerivativeOrderSide.Sell
              : DerivativeOrderSide.Buy,
          price: executionPrice,
          quantity: new BigNumberInBase(position.quantity)
        })
        .then(() => {
          this.$toast.success(this.$t('position_closed'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
