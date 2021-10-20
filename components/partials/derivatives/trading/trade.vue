<template>
  <div v-if="market" class="px-4 w-full">
    <div class="flex items-center justify-center">
      <v-button
        :class="{
          'text-gray-500': tradingType === TradeExecutionType.LimitFill
        }"
        text-xs
        @click.stop="onTradingTypeToggle"
      >
        {{ $t('market') }}
      </v-button>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button
        sm
        :class="{
          'text-gray-500': tradingType === TradeExecutionType.Market
        }"
        text-xs
        @click.stop="onTradingTypeToggle"
      >
        {{ $t('limit') }}
      </v-button>
    </div>
    <div class="mt-4">
      <div class="bg-gray-900 rounded-2xl flex">
        <v-button-select
          v-model="orderType"
          :option="DerivativeOrderSide.Buy"
          aqua
          class="w-1/2"
        >
          {{ $t('buy_asset', { asset: market.baseToken.symbol }) }}
        </v-button-select>
        <v-button-select
          v-model="orderType"
          :option="DerivativeOrderSide.Sell"
          red
          class="w-1/2"
        >
          {{ $t('sell_asset', { asset: market.baseToken.symbol }) }}
        </v-button-select>
      </div>
    </div>
    <div class="mt-8">
      <div>
        <v-input
          ref="input-amount"
          :value="form.amount"
          :label="$t('amount')"
          :custom-handler="true"
          :max-selector="true"
          :placeholder="$t('amount')"
          type="number"
          :step="amountStep"
          min="0"
          @blur="onAmountBlur"
          @input="onAmountChange"
          @input-max="() => onMaxInput(100)"
        >
          <span slot="addon">{{ market.baseToken.symbol.toUpperCase() }}</span>
          <div slot="context" class="text-xs text-gray-400 flex items-center">
            <span class="mr-1 cursor-pointer" @click.stop="onMaxInput(25)">
              25%
            </span>
            <span class="mr-1 cursor-pointer" @click.stop="onMaxInput(50)">
              50%
            </span>
            <span class="mr-1 cursor-pointer" @click.stop="onMaxInput(75)">
              75%
            </span>
            <span class="cursor-pointer" @click.stop="onMaxInput(100)">
              100%
            </span>
          </div>
        </v-input>
        <span v-if="amountError" class="text-2xs font-semibold text-red-500">
          {{ amountError }}
        </span>
        <span
          v-if="priceError && tradingTypeMarket"
          class="text-2xs font-semibold text-red-500"
        >
          {{ priceError }}
        </span>
      </div>
      <div v-if="!tradingTypeMarket" class="mt-6">
        <v-input
          ref="input-price"
          :value="form.price"
          :placeholder="$t('price')"
          :label="$t('price')"
          :disabled="tradingTypeMarket"
          type="number"
          :step="priceStep"
          min="0"
          @blur="onPriceBlur"
          @input="onPriceChange"
        >
          <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
        </v-input>
        <span v-if="priceError" class="text-red-500 font-semibold text-2xs">
          {{ priceError }}
        </span>
      </div>

      <v-order-leverage
        class="mt-6"
        :leverage="form.leverage"
        :max-leverage="maxLeverageAvailable.toFixed()"
        @change="onLeverageChange"
      />

      <v-order-leverage-select
        v-if="false"
        class="mt-4"
        :max-leverage="maxLeverageAvailable.toFixed()"
        :leverage="form.leverage"
        @change="onLeverageChange"
      />

      <v-button-checkbox
        v-if="showReduceOnly"
        v-model="form.reduceOnly"
        class="mt-2"
        :title="$t('reduce_only')"
      />
    </div>
    <component
      :is="tradingTypeMarket ? `v-order-details-market` : 'v-order-details'"
      v-bind="{
        price: executionPrice,
        notionalValue,
        liquidationPrice,
        margin,
        feeReturned,
        orderTypeReduceOnly,
        orderType,
        fees,
        total,
        totalWithFees,
        amount,
        detailsDrawerOpen
      }"
      @drawer-toggle="onDetailsDrawerToggle"
    />
    <div class="mt-4">
      <v-button
        lg
        :status="status"
        :disabled="hasErrors || !isUserWalletConnected"
        :ghost="hasErrors"
        :aqua="!hasErrors && orderType === DerivativeOrderSide.Buy"
        :red="!hasErrors && orderType === DerivativeOrderSide.Sell"
        class="w-full"
        @click.stop="onSubmit"
      >
        {{ $t(orderTypeBuy ? 'buy_long' : 'sell_short') }}
      </v-button>
    </div>

    <v-modal-order-confirm
      @confirmed="submitLimitOrder"
      @disabled="handleDisableAcceptHighPriceDeviations"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradeError } from 'types/errors'
import { Status, BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import OrderDetails from './order-details.vue'
import OrderLeverage from './order-leverage.vue'
import OrderLeverageSelect from './order-leverage-select.vue'
import OrderDetailsMarket from './order-details-market.vue'
import {
  DEFAULT_MAX_SLIPPAGE,
  ZERO_IN_BASE,
  NUMBER_REGEX,
  DEFAULT_PRICE_WARNING_DEVIATION
} from '~/app/utils/constants'
import ButtonCheckbox from '~/components/inputs/button-checkbox.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import {
  DerivativeOrderSide,
  TradeExecutionType,
  UiDerivativeOrderbook,
  UiPriceLevel,
  UiDerivativeMarket,
  UiSubaccount,
  UiPosition,
  TradeDirection,
  UiDerivativeMarketSummary,
  UiDerivativeLimitOrder,
  Modal
} from '~/types'
import {
  calculateWorstExecutionPriceFromOrderbook,
  calculateLiquidationPrice,
  calculateMargin,
  getApproxAmountForMarketOrder
} from '~/app/services/derivatives'

interface TradeForm {
  reduceOnly: boolean
  amount: string
  price: string
  leverage: string
}

const initialForm = (): TradeForm => ({
  reduceOnly: false,
  amount: '',
  price: '',
  leverage: '1'
})

export default Vue.extend({
  components: {
    'v-button-checkbox': ButtonCheckbox,
    'v-order-details': OrderDetails,
    'v-order-leverage': OrderLeverage,
    'v-order-leverage-select': OrderLeverageSelect,
    'v-order-details-market': OrderDetailsMarket,
    VModalOrderConfirm
  },

  data() {
    return {
      TradeExecutionType,
      DerivativeOrderSide,
      tradingType: TradeExecutionType.Market,
      orderType: DerivativeOrderSide.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    acceptHighPriceDeviations(): boolean {
      return this.$accessor.app.acceptHighPriceDeviations
    },

    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    marketMarkPrice(): string {
      return this.$accessor.derivatives.marketMarkPrice
    },

    marketSummary(): UiDerivativeMarketSummary | undefined {
      return this.$accessor.derivatives.marketSummary
    },

    lastTradedPrice(): BigNumberInBase {
      return this.$accessor.derivatives.lastTradedPrice
    },

    orderbook(): UiDerivativeOrderbook | undefined {
      return this.$accessor.derivatives.orderbook
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    position(): UiPosition | undefined {
      return this.$accessor.derivatives.subaccountPosition
    },

    derivativeMarkPrice(): string {
      return this.$accessor.derivatives.marketMarkPrice
    },

    availableMargin(): BigNumberInBase {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.quoteDenom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
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

    amount(): BigNumberInBase {
      return new BigNumberInBase(this.form.amount)
    },

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
    },

    slippage(): BigNumberInBase {
      const { orderTypeBuy } = this

      return new BigNumberInBase(
        orderTypeBuy
          ? DEFAULT_MAX_SLIPPAGE.div(100).plus(1)
          : DEFAULT_MAX_SLIPPAGE.div(100).minus(1).times(-1)
      )
    },

    price(): BigNumberInBase {
      return new BigNumberInBase(this.form.price)
    },

    showReduceOnly(): boolean {
      const { orderType, position } = this

      if (!position) {
        return false
      }

      if (
        position.direction === TradeDirection.Long &&
        orderType === DerivativeOrderSide.Buy
      ) {
        return false
      }

      if (
        position.direction === TradeDirection.Short &&
        orderType === DerivativeOrderSide.Sell
      ) {
        return false
      }

      return true
    },

    executionPrice(): BigNumberInBase {
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        amount,
        price,
        slippage
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (tradingTypeMarket) {
        if (!hasAmount) {
          return ZERO_IN_BASE
        }

        const records = orderTypeBuy ? sells : buys

        const worstPrice = calculateWorstExecutionPriceFromOrderbook({
          records,
          amount,
          market
        })

        return new BigNumberInBase(
          worstPrice.times(slippage).toFixed(market.priceDecimals)
        )
      }

      if (price.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(price).toFixed(market.priceDecimals)
      )
    },

    hasPrice(): boolean {
      const { executionPrice, priceStep } = this

      return (
        !executionPrice.isNaN() &&
        executionPrice.gt(0) &&
        executionPrice.gte(priceStep)
      )
    },

    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === DerivativeOrderSide.Buy
    },

    orderTypeReduceOnly(): boolean {
      return this.form.reduceOnly && this.showReduceOnly
    },

    maxReduceOnly(): BigNumberInBase {
      const { market, position, orders, orderTypeReduceOnly } = this

      if (!orderTypeReduceOnly || !position || !market) {
        return ZERO_IN_BASE
      }

      const reduceOnlyOrders = orders.filter((o) => o.isReduceOnly)
      const aggregateReduceOnlyQuantity = reduceOnlyOrders.reduce(
        (total, order) => total.plus(order.quantity),
        ZERO_IN_BASE
      )

      return new BigNumberInBase(position.quantity).minus(
        aggregateReduceOnlyQuantity
      )
    },

    amountStep(): string {
      const { market } = this

      if (!market) {
        return '1'
      }

      const decimalsAllowed = new BigNumberInBase(market.quantityDecimals)

      if (decimalsAllowed.eq(0)) {
        return '1'
      }

      if (decimalsAllowed.eq(1)) {
        return '0.1'
      }

      if (decimalsAllowed.gt(1)) {
        return '0.' + '0'.repeat(decimalsAllowed.toNumber() - 1) + '1'
      }

      return '1'
    },

    priceStep(): string {
      const { market } = this

      if (!market) {
        return '1'
      }

      const decimalsAllowed = new BigNumberInBase(market.priceDecimals)

      if (decimalsAllowed.eq(0)) {
        return '1'
      }

      if (decimalsAllowed.eq(1)) {
        return '0.1'
      }

      if (decimalsAllowed.gt(1)) {
        return '0.' + '0'.repeat(decimalsAllowed.toNumber() - 1) + '1'
      }

      return '1'
    },

    availableMarginError(): TradeError | undefined {
      const { availableMargin, orderTypeReduceOnly, totalWithFees } = this

      if (orderTypeReduceOnly) {
        return undefined
      }

      if (availableMargin.lt(totalWithFees)) {
        return {
          amount: this.$t('not_enough_balance')
        }
      }

      return undefined
    },

    maxLeverageError(): TradeError | undefined {
      const {
        form,
        executionPrice,
        orderTypeBuy,
        hasPrice,
        market,
        marketMarkPrice
      } = this

      if (!hasPrice || !market) {
        return
      }

      const leverage = new BigNumberInBase(form.leverage)
      const divisor = orderTypeBuy
        ? new BigNumberInBase(marketMarkPrice)
            .times(market.initialMarginRatio)
            .minus(marketMarkPrice)
            .plus(executionPrice)
        : new BigNumberInBase(marketMarkPrice)
            .times(market.initialMarginRatio)
            .plus(marketMarkPrice)
            .minus(executionPrice)
      const maxLeverage = executionPrice.dividedBy(divisor)

      if (maxLeverage.gte(0) && leverage.gt(maxLeverage)) {
        return {
          price: leverage.eq(1)
            ? this.$t('orderbook_liquidity_cannot_satisfy')
            : this.$t('max_leverage_warn')
        }
      }

      return undefined
    },

    reduceOnlyExcessError(): TradeError | undefined {
      const { maxReduceOnly, orderTypeReduceOnly, form } = this

      if (
        orderTypeReduceOnly &&
        new BigNumberInBase(form.amount).gt(maxReduceOnly)
      ) {
        return {
          amount: this.$t('reduce_only_in_excess')
        }
      }

      return undefined
    },

    maxOrdersError(): string | undefined {
      const { orders, tradingTypeMarket, orderType } = this
      const MAX_NUMBER_OF_ORDERS = 20
      const filteredOrders = orders.filter(
        (order) => order.orderSide === orderType
      )

      if (tradingTypeMarket) {
        return undefined
      }

      if (filteredOrders.length >= MAX_NUMBER_OF_ORDERS) {
        return this.$t('you_can_only_have_max_orders', {
          number: MAX_NUMBER_OF_ORDERS
        })
      }

      return undefined
    },

    notEnoughOrdersToFillFromError(): TradeError | undefined {
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        amount,
        hasAmount
      } = this

      if (!tradingTypeMarket || !hasAmount) {
        return
      }

      const orders = orderTypeBuy ? sells : buys

      if (orders.length <= 0 && amount.gt(0)) {
        return {
          amount: this.$t('not_enough_fillable_orders')
        }
      }

      return undefined
    },

    amountTooBigToFillError(): TradeError | undefined {
      const {
        tradingTypeMarket,
        hasPrice,
        hasAmount,
        orderTypeBuy,
        sells,
        buys,
        amount,
        market
      } = this

      if (!tradingTypeMarket || !hasPrice || !hasAmount || !market) {
        return
      }

      const orders = orderTypeBuy ? sells : buys
      const totalAmount = orders.reduce((totalAmount, { quantity }) => {
        return totalAmount.plus(new BigNumberInBase(quantity))
      }, ZERO_IN_BASE)

      if (totalAmount.lt(amount)) {
        return {
          amount: this.$t('not_enough_fillable_orders')
        }
      }

      return undefined
    },

    markPriceThresholdError(): TradeError | undefined {
      const {
        market,
        marketMarkPrice,
        orderTypeBuy,
        margin,
        hasPrice,
        hasAmount,
        executionPrice,
        amount
      } = this

      if (!marketMarkPrice || !market || !hasPrice || !hasAmount) {
        return undefined
      }

      const markPrice = new BigNumberInBase(marketMarkPrice)

      if (markPrice.lte(0)) {
        return {
          amount: this.$t('mark_price_invalid')
        }
      }

      const notional = executionPrice.times(amount)
      const dividend = orderTypeBuy
        ? notional.minus(margin)
        : margin.plus(notional)
      const divisor = amount.times(
        orderTypeBuy
          ? new BigNumberInBase(1).minus(market.initialMarginRatio)
          : new BigNumberInBase(market.initialMarginRatio).plus(1)
      )
      const condition = dividend.div(divisor)

      if (orderTypeBuy && markPrice.lt(condition)) {
        return {
          amount: this.$t('order_insufficient_margin')
        }
      }

      if (!orderTypeBuy && markPrice.gt(condition)) {
        return {
          amount: this.$t('order_insufficient_margin')
        }
      }

      return undefined
    },

    priceNotValidError(): TradeError | undefined {
      const { form } = this

      if (!form.price) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.price)) {
        return undefined
      }

      return {
        price: this.$t('not_valid_number')
      }
    },

    priceHasHighDeviationWarning(): boolean {
      const {
        price,
        orderTypeBuy,
        tradingTypeMarket,
        orderTypeReduceOnly,
        lastTradedPrice
      } = this

      if (orderTypeReduceOnly) {
        return false
      }

      if (tradingTypeMarket) {
        return false
      }

      if (price.lte(0)) {
        return false
      }

      const deviation = new BigNumberInBase(1)
        .minus(
          orderTypeBuy
            ? lastTradedPrice.dividedBy(price)
            : price.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(DEFAULT_PRICE_WARNING_DEVIATION)
    },

    amountNotValidNumberError(): TradeError | undefined {
      const { form } = this

      if (!form.amount) {
        return undefined
      }

      if (NUMBER_REGEX.test(form.amount)) {
        return undefined
      }

      return {
        amount: this.$t('not_valid_number')
      }
    },

    priceError(): string | null {
      const { price } = this.errors

      return price || null
    },

    amountError(): string | null {
      const { amount } = this.errors

      return amount || null
    },

    errors(): TradeError {
      if (this.availableMarginError) {
        return this.availableMarginError
      }

      if (this.amountTooBigToFillError) {
        return this.amountTooBigToFillError
      }

      if (this.notEnoughOrdersToFillFromError) {
        return this.notEnoughOrdersToFillFromError
      }

      if (this.maxLeverageError) {
        return this.maxLeverageError
      }

      if (this.reduceOnlyExcessError) {
        return this.reduceOnlyExcessError
      }

      if (this.amountNotValidNumberError) {
        return this.amountNotValidNumberError
      }

      if (this.priceNotValidError) {
        return this.priceNotValidError
      }

      if (this.markPriceThresholdError) {
        return this.markPriceThresholdError
      }

      return { price: '', amount: '' }
    },

    hasErrors(): boolean {
      const {
        priceError,
        amountError,
        tradingTypeMarket,
        hasAmount,
        hasPrice,
        price,
        amount
      } = this

      if (priceError) {
        return true
      }

      if (amountError) {
        return true
      }

      if (!hasAmount) {
        return true
      }

      if (amount.lte(0)) {
        return true
      }

      if (!tradingTypeMarket) {
        if (price.lte(0) || !hasPrice) {
          return true
        }
      }

      if (!tradingTypeMarket && hasPrice && price.lte(0)) {
        return true
      }

      return false
    },

    maxLeverageAvailable(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const maxLeverage = new BigNumberInBase(
        new BigNumberInBase(1).dividedBy(market.initialMarginRatio).dp(0)
      )

      const steps = [1, 2, 5, 10, 20, 50, 100, 150, 200]

      const stepsLessThanMaxLeverage = steps.filter(
        (step) => step <= maxLeverage.toNumber()
      )

      return stepsLessThanMaxLeverage.length > 0
        ? new BigNumberInBase(
            stepsLessThanMaxLeverage[stepsLessThanMaxLeverage.length - 1]
          )
        : new BigNumberInBase(20)
    },

    margin(): BigNumberInBase {
      const { executionPrice, hasPrice, hasAmount, form, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        calculateMargin({
          quantity: form.amount,
          price: executionPrice.toFixed(),
          leverage: form.leverage
        }).toFixed(market.priceDecimals)
      )
    },

    notionalValue(): BigNumberInBase {
      const {
        derivativeMarkPrice,
        tradingTypeMarket,
        executionPrice,
        amount,
        market
      } = this

      if (amount.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      const price = tradingTypeMarket
        ? new BigNumberInBase(derivativeMarkPrice)
        : executionPrice
      const notional = amount.times(price)

      if (notional.lt(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(notional)
    },

    fees(): BigNumberInBase {
      const { notionalValue, market } = this

      if (notionalValue.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return notionalValue.times(market.takerFeeRate)
    },

    feeReturned(): BigNumberInBase {
      const { notionalValue, market } = this

      if (notionalValue.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return notionalValue.times(
        new BigNumberInBase(market.takerFeeRate).minus(market.makerFeeRate)
      )
    },

    total(): BigNumberInBase {
      const { hasPrice, hasAmount, margin, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(margin)
    },

    totalWithFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return fees.plus(total)
    },

    liquidationPrice(): BigNumberInBase {
      const {
        executionPrice,
        margin,
        hasAmount,
        hasPrice,
        orderType,
        market,
        form
      } = this

      if (!hasAmount || !hasPrice || !market) {
        return ZERO_IN_BASE
      }

      return calculateLiquidationPrice({
        market,
        orderType,
        margin: margin.toFixed(),
        price: executionPrice.toFixed(),
        quantity: form.amount
      })
    }
  },

  watch: {
    orderType() {
      const { tradingType, form, market } = this

      if (tradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(form.price)
      }
    },

    tradingType(newTradingType: TradeExecutionType) {
      const { form, market } = this

      if (newTradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(form.price)
      }
    },

    orderTypeReduceOnly(newReduceOnly: boolean) {
      if (newReduceOnly) {
        this.onLeverageChange('1') // set the leverage to 1 if the reduce only is set
      }
    }
  },

  mounted() {
    this.$root.$on('orderbook-price-click', this.onOrderbookPriceClick)
    this.$root.$on('orderbook-size-click', this.onOrderbookSizeClick)
    this.$root.$on('orderbook-notional-click', this.onOrderbookNotionalClick)
  },

  methods: {
    /**
     * We need to first update the form amount
     * in order to get the new fees that apply to this order
     * and then we update the amount again to acount the fees
     * into consideration
     */
    onMaxInput(percent = 100) {
      this.onAmountChange(this.getMaxAmountValue(percent))
      this.$nextTick(() => {
        this.onAmountChange(this.getMaxAmountValue(percent))
      })
    },

    getMaxAmountValue(percentage: number): string {
      const {
        market,
        buys,
        sells,
        form,
        tradingTypeMarket,
        orderTypeBuy,
        position,
        maxReduceOnly,
        orderTypeReduceOnly,
        availableMargin,
        executionPrice,
        slippage
      } = this
      const percentageToNumber = new BigNumberInBase(percentage).div(100)

      if (!market) {
        return ''
      }

      if (orderTypeReduceOnly && position) {
        return maxReduceOnly
          .times(percentageToNumber)
          .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      }

      if (tradingTypeMarket) {
        return getApproxAmountForMarketOrder({
          market,
          margin: availableMargin,
          leverage: form.leverage,
          slippage: slippage.toNumber(),
          percent: percentageToNumber.toNumber(),
          records: orderTypeBuy ? sells : buys
        }).toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      }

      if (executionPrice.lte(0)) {
        return ''
      }

      if (availableMargin.lte(0)) {
        return ''
      }

      const fee = new BigNumberInBase(market.takerFeeRate)

      return new BigNumberInBase(availableMargin)
        .times(form.leverage)
        .dividedBy(executionPrice.times(fee.times(form.leverage).plus(1)))
        .times(percentageToNumber)
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onOrderbookSizeClick(size: string) {
      this.onAmountChange(size)
    },

    onOrderbookNotionalClick({
      total,
      price,
      type
    }: {
      total: BigNumberInBase
      price: BigNumberInBase
      type: DerivativeOrderSide
    }) {
      const { market, slippage } = this

      if (!market) {
        return
      }

      this.tradingType = TradeExecutionType.Market
      this.orderType =
        type === DerivativeOrderSide.Buy
          ? DerivativeOrderSide.Sell
          : DerivativeOrderSide.Buy

      const amount = total
        .dividedBy(price.times(slippage).toFixed(market.priceDecimals))
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)

      this.$nextTick(() => {
        this.onAmountChange(amount)
      })
    },

    onOrderbookPriceClick(price: string) {
      this.tradingType = TradeExecutionType.LimitFill

      this.$nextTick(() => {
        this.onPriceChange(price)
      })
    },

    onPriceChange(price: string = '') {
      this.form.price = price
    },

    onPriceBlur() {
      const { market, form, hasPrice } = this

      if (!market || !hasPrice) {
        return
      }

      this.form.price = new BigNumberInBase(form.price || 0).toFixed(
        market.priceDecimals
      )
    },

    onAmountBlur() {
      const { market, form } = this

      if (!market) {
        return
      }

      this.form.amount = new BigNumberInBase(form.amount || 0).toFixed(
        market.quantityDecimals
      )
    },

    onAmountChange(amount: string = '') {
      this.form.amount = amount
    },

    onTradingTypeToggle() {
      this.tradingType =
        this.tradingType === TradeExecutionType.LimitFill
          ? TradeExecutionType.Market
          : TradeExecutionType.LimitFill
    },

    handleEnableAcceptHighPriceDeviations() {
      this.$accessor.app.setAcceptHighPriceDeviations(true)
    },

    handleDisableAcceptHighPriceDeviations() {
      this.$accessor.app.setAcceptHighPriceDeviations(false)
    },

    onLeverageChange(leverage: string) {
      const { maxLeverageAvailable } = this
      const leverageToBigNumber = new BigNumberInBase(leverage)

      if (leverageToBigNumber.gte(maxLeverageAvailable)) {
        this.form.leverage = maxLeverageAvailable.toFixed()
      } else if (leverageToBigNumber.lte(1)) {
        this.form.leverage = '1'
      } else {
        this.form.leverage = leverageToBigNumber.toFixed()
      }
    },

    submitLimitOrder() {
      const {
        orderType,
        market,
        margin,
        price,
        orderTypeReduceOnly,
        amount
      } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .submitLimitOrder({
          price,
          margin,
          orderType,
          reduceOnly: orderTypeReduceOnly,
          quantity: amount
        })
        .then(() => {
          this.$toast.success(this.$t('order_placed'))
          this.$set(this, 'form', initialForm())
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    submitMarketOrder() {
      const {
        orderType,
        orderTypeReduceOnly,
        market,
        margin,
        executionPrice,
        amount
      } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .submitMarketOrder({
          orderType,
          margin,
          reduceOnly: orderTypeReduceOnly,
          price: executionPrice,
          quantity: amount
        })
        .then(() => {
          this.$toast.success(this.$t('trade_placed'))
          this.$set(this, 'form', initialForm())
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    onSubmit() {
      const {
        hasErrors,
        maxOrdersError,
        tradingTypeMarket,
        isUserWalletConnected,
        priceHasHighDeviationWarning,
        acceptHighPriceDeviations
      } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasErrors) {
        return this.$toast.error(this.$t('error_in_form'))
      }

      if (maxOrdersError) {
        return this.$toast.error(maxOrdersError)
      }

      if (tradingTypeMarket) {
        return this.submitMarketOrder()
      }

      if (!priceHasHighDeviationWarning) {
        return this.submitLimitOrder()
      }

      // If price has high deviation, we open a confirm modal
      if (acceptHighPriceDeviations) {
        return this.$accessor.modal.openModal(Modal.OrderConfirm)
      } else {
        // If price has high deviation, show a confirm toast that can disable the setting
        return this.$onConfirm(
          this.$t('high_price_deviation_warning', {
            percentage: DEFAULT_PRICE_WARNING_DEVIATION
          }),
          this.handleEnableAcceptHighPriceDeviations
        )
      }
    }
  }
})
</script>
