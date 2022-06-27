<template>
  <div v-if="market" class="px-4 w-full">
    <TradingTypeButtons
      :trading-type.sync="tradingType"
      @update:trading-type="handleTradingTypeChange"
    />

    <OrderTypeSelect
      :order-type.sync="orderType"
      v-bind="{ market }"
      @update:order-type="handleOrderTypeChange"
    />

    <OrderInputs
      ref="orderInputs"
      class="mt-8"
      v-bind="{
        tradingTypeMarket,
        market,
        sells,
        takerFeeRate,
        hasPrice,
        buys,
        orderTypeBuy,
        orderType,
        executionPrice,
        feeRate,
        lastTradedPrice,
        notionalWithLeverageAndFees,
        hasAmount,
        slippageTolerance: form.slippageTolerance,
        showReduceOnly,
        tradingType,
        averagePriceOption,
        notionalWithLeverage,
        position,
        orderTypeReduceOnly,
        quoteAvailableBalance,
        showReduceOnly
      }"
      :average-price-option.sync="averagePriceOption"
      :amount.sync="form.amount"
      :quote-amount.sync="form.quoteAmount"
      :price.sync="form.price"
      :post-only.sync="form.postOnly"
      :reduce-only.sync="form.reduceOnly"
      :leverage.sync="form.leverage"
      :slippage-tolerance.sync="form.slippageTolerance"
      :proportional-percentage.sync="form.proportionalPercentage"
      :has-input-errors.sync="hasInputErrors"
      :has-advanced-settings-errors.sync="hasAdvancedSettingsErrors"
      @update-price-from-last-traded-price="updatePriceFromLastTradedPrice"
    />

    <OrderDetailsWrapper
      v-bind="{
        amount,
        executionPrice,
        feeRate,
        fees,
        market,
        makerFeeRate,
        makerFeeRateDiscount,
        orderType,
        orderTypeBuy,
        postOnly: form.postOnly,
        quoteAmount,
        slippage,
        takerFeeRate,
        takerFeeRateDiscount,
        notionalWithLeverageToBigNumber,
        notionalWithLeverageAndFees,
        tradingTypeMarket,
        notionalValue,
        liquidationPrice,
        notionalWithLeverage,
        orderTypeReduceOnly
      }"
    />

    <OrderSubmit
      v-bind="{
        executionPrice,
        hasAmount,
        hasInputErrors,
        hasAdvancedSettingsErrors,
        hasPrice,
        lastTradedPrice,
        market,
        orderType,
        orderTypeBuy,
        orderTypeReduceOnly,
        status,
        tradingTypeMarket
      }"
      @submit="onSubmit"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status, BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  TradeDirection,
  TradeExecutionType,
  Wallet
} from '@injectivelabs/ts-types'
import {
  DerivativeOrderSide,
  UiDerivativeLimitOrder,
  UiDerivativeMarketSummary,
  UiDerivativeOrderbook,
  UiPosition,
  UiPriceLevel,
  ZERO_IN_BASE,
  UiSubaccount,
  UiPerpetualMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import OrderTypeSelect from '~/components/partials/common/trade/order-type-select.vue'
import OrderSubmit from '~/components/partials/common/trade/order-submit.vue'
import OrderInputs from '~/components/partials/common/trade/order-inputs.vue'
import TradingTypeButtons from '~/components/partials/common/trade/trading-type-buttons.vue'
import OrderDetailsWrapper from '~/components/partials/common/trade/order-details-wrapper.vue'
import { AveragePriceOptions } from '~/types'
import {
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook,
  calculateLiquidationPrice,
  calculateMargin,
  calculateAverageExecutionPriceFromFillableNotionalOnOrderBook
} from '~/app/client/utils/derivatives'

interface TradeForm {
  reduceOnly: boolean
  amount: string
  quoteAmount: string
  postOnly: boolean
  price: string
  leverage: string
  slippageTolerance: string
  proportionalPercentage: number
}

const initialForm = (): TradeForm => ({
  reduceOnly: false,
  amount: '',
  quoteAmount: '',
  postOnly: false,
  price: '',
  leverage: '1',
  slippageTolerance: '0.5',
  proportionalPercentage: 0
})

export default Vue.extend({
  components: {
    OrderDetailsWrapper,
    OrderInputs,
    OrderTypeSelect,
    OrderSubmit,
    TradingTypeButtons
  },

  data() {
    return {
      TradeExecutionType,
      DerivativeOrderSide,
      tradingType: TradeExecutionType.LimitFill,
      orderType: DerivativeOrderSide.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm(),
      hasInputErrors: false,
      hasAdvancedSettingsErrors: false,
      averagePriceOption: AveragePriceOptions.None
    }
  },

  computed: {
    market():
      | UiPerpetualMarketWithToken
      | UiExpiryFuturesMarketWithToken
      | undefined {
      return this.$accessor.derivatives.market as
        | UiPerpetualMarketWithToken
        | UiExpiryFuturesMarketWithToken
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
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

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    orderTypeToSubmit(): DerivativeOrderSide {
      const {
        form: { postOnly },
        orderTypeBuy
      } = this

      switch (true) {
        case postOnly && orderTypeBuy: {
          return DerivativeOrderSide.BuyPO
        }
        case orderTypeBuy: {
          return DerivativeOrderSide.Buy
        }
        case postOnly && !orderTypeBuy: {
          return DerivativeOrderSide.SellPO
        }
        case !orderTypeBuy: {
          return DerivativeOrderSide.Sell
        }
        default: {
          return DerivativeOrderSide.Buy
        }
      }
    },

    worstPrice(): BigNumberInBase {
      const { orderTypeBuy, slippage, sells, buys, hasAmount, market, amount } =
        this

      if (!market || !hasAmount) {
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
    },

    position(): UiPosition | undefined {
      const { positions, market } = this

      if (positions.length === 0 || !market) {
        return
      }

      return positions.find((position) => position.marketId === market.marketId)
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    quoteAvailableBalance(): BigNumberInBase {
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

      const quoteAvailableBalance = new BigNumberInWei(
        balance.availableBalance || 0
      ).toBase(market.quoteToken.decimals)

      if (quoteAvailableBalance.isNaN()) {
        return ZERO_IN_BASE
      }

      return quoteAvailableBalance
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
      const {
        form: { amount }
      } = this

      return amount ? new BigNumberInBase(amount) : ZERO_IN_BASE
    },

    quoteAmount(): BigNumberInBase {
      const {
        form: { quoteAmount }
      } = this

      return quoteAmount ? new BigNumberInBase(quoteAmount) : ZERO_IN_BASE
    },

    hasAmount(): boolean {
      const { amount } = this

      return amount.gt('0')
    },

    slippage(): BigNumberInBase {
      const {
        orderTypeBuy,
        form: { slippageTolerance }
      } = this

      const slippageAsBigNumber = new BigNumberInBase(slippageTolerance)

      return new BigNumberInBase(
        orderTypeBuy
          ? slippageAsBigNumber.div(100).plus(1)
          : slippageAsBigNumber.div(100).minus(1).times(-1)
      )
    },

    makerFeeRateDiscount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      const discount = cosmosSdkDecToBigNumber(
        feeDiscountAccountInfo.accountInfo.makerDiscountRate
      )

      return new BigNumberInBase(discount)
    },

    takerFeeRateDiscount(): BigNumberInBase {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return ZERO_IN_BASE
      }

      if (!feeDiscountAccountInfo.accountInfo) {
        return ZERO_IN_BASE
      }

      const discount = cosmosSdkDecToBigNumber(
        feeDiscountAccountInfo.accountInfo.takerDiscountRate
      )

      return new BigNumberInBase(discount)
    },

    makerFeeRate(): BigNumberInBase {
      const { market, makerFeeRateDiscount } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const makerFeeRate = new BigNumberInBase(market.makerFeeRate)

      if (makerFeeRate.lte(0)) {
        return makerFeeRate
      }

      return new BigNumberInBase(market.makerFeeRate).times(
        new BigNumberInBase(1).minus(makerFeeRateDiscount)
      )
    },

    takerFeeRate(): BigNumberInBase {
      const { market, takerFeeRateDiscount } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.takerFeeRate).times(
        new BigNumberInBase(1).minus(takerFeeRateDiscount)
      )
    },

    feeRate(): BigNumberInBase {
      const {
        form: { postOnly },
        takerFeeRate,
        makerFeeRate
      } = this

      if (!postOnly) {
        return takerFeeRate
      }

      return makerFeeRate
    },

    price(): BigNumberInBase {
      return new BigNumberInBase(this.form.price)
    },

    showReduceOnly(): boolean {
      const { orderType, position } = this

      if (!position) {
        return false
      }

      const longAndBuy =
        position.direction === TradeDirection.Long &&
        orderType === DerivativeOrderSide.Buy

      const shortAndSell =
        position.direction === TradeDirection.Short &&
        orderType === DerivativeOrderSide.Sell

      return !(longAndBuy || shortAndSell)
    },

    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    averagePriceDerivedFromBaseAmount(): BigNumberInBase {
      const { orderTypeBuy, sells, buys, hasAmount, market, amount } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(averagePrice.toFixed(market.priceDecimals))
    },

    averagePriceDerivedFromQuoteAmount(): BigNumberInBase {
      const {
        orderTypeBuy,
        sells,
        buys,
        market,
        quoteAmount,
        quoteAvailableBalance,
        form: { proportionalPercentage }
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const quoteAmountForAveragePrice =
        proportionalPercentage > 0 ? quoteAvailableBalance : quoteAmount

      const averagePrice =
        calculateAverageExecutionPriceFromFillableNotionalOnOrderBook({
          records,
          quoteAmount: quoteAmountForAveragePrice,
          market
        })

      return new BigNumberInBase(averagePrice.toFixed(market.priceDecimals))
    },

    averagePrice(): BigNumberInBase {
      const {
        averagePriceDerivedFromBaseAmount,
        averagePriceDerivedFromQuoteAmount
      } = this

      if (averagePriceDerivedFromBaseAmount.gt(0)) {
        return averagePriceDerivedFromBaseAmount
      }

      return averagePriceDerivedFromQuoteAmount
    },

    executionPrice(): BigNumberInBase {
      const { tradingTypeMarket, averagePrice, price } = this

      return tradingTypeMarket ? averagePrice : price
    },

    hasPrice(): boolean {
      const { price } = this

      return price.gt('0')
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === DerivativeOrderSide.Buy
    },

    orderTypeReduceOnly(): boolean {
      return this.form.reduceOnly && this.showReduceOnly
    },

    notionalWithLeverage(): BigNumberInBase {
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

    notionalWithLeverageBasedOnWorstPrice(): BigNumberInBase {
      const { worstPrice, hasPrice, hasAmount, form, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        calculateMargin({
          quantity: form.amount,
          price: worstPrice.toFixed(),
          leverage: form.leverage
        }).toFixed(market.priceDecimals)
      )
    },

    notionalValue(): BigNumberInBase {
      const { executionPrice, amount, market } = this

      if (amount.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      const notional = amount.times(executionPrice)

      if (notional.lt(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(notional)
    },

    fees(): BigNumberInBase {
      const { notionalValue, feeRate } = this

      if (notionalValue.isNaN()) {
        return ZERO_IN_BASE
      }

      return notionalValue.times(feeRate)
    },

    notionalWithLeverageToBigNumber(): BigNumberInBase {
      const { hasPrice, hasAmount, notionalWithLeverage, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(notionalWithLeverage)
    },

    feeRebates(): BigNumberInBase {
      const { notionalWithLeverageToBigNumber, makerFeeRate, market } = this

      if (
        !market ||
        notionalWithLeverageToBigNumber.isNaN() ||
        makerFeeRate.gte(0)
      ) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        notionalWithLeverageToBigNumber.times(makerFeeRate).abs()
      ).times(0.6 /* Only 60% of the fees are getting returned */)
    },

    notionalWithLeverageAndFees(): BigNumberInBase {
      const { fees, notionalWithLeverageToBigNumber, market } = this

      if (
        notionalWithLeverageToBigNumber.isNaN() ||
        notionalWithLeverageToBigNumber.lte(0) ||
        !market
      ) {
        return ZERO_IN_BASE
      }

      return fees.plus(notionalWithLeverageToBigNumber)
    },

    liquidationPrice(): BigNumberInBase {
      const {
        executionPrice,
        notionalWithLeverage,
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
        notionalWithLeverage: notionalWithLeverage.toFixed(),
        price: executionPrice.toFixed(),
        quantity: form.amount
      })
    },

    hubUrl(): string {
      return 'https://hub.injective.network/bridge'
    },

    $orderInputs(): any {
      return this.$refs.orderInputs
    }
  },

  mounted() {
    this.$root.$on('orderbook-price-click', this.onOrderbookPriceClick)
    this.$root.$on('orderbook-size-click', this.onOrderbookSizeClick)
    this.$root.$on('orderbook-notional-click', this.onOrderbookNotionalClick)
  },

  methods: {
    handleOrderTypeChange() {
      const {
        form: { quoteAmount }
      } = this

      this.$nextTick(() => this.$orderInputs.onQuoteAmountChange(quoteAmount))
    },

    handleTradingTypeChange() {
      const {
        form: { quoteAmount }
      } = this

      this.$nextTick(() => this.$orderInputs.onQuoteAmountChange(quoteAmount))
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onOrderbookSizeClick(size: string) {
      this.$orderInputs.onAmountChange(size)
    },

    onOrderbookNotionalClick({
      notionalWithLeverageToBigNumber,
      price,
      type
    }: {
      notionalWithLeverageToBigNumber: BigNumberInBase
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

      const amount = notionalWithLeverageToBigNumber
        .dividedBy(price.times(slippage).toFixed(market.priceDecimals))
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)

      this.$nextTick(() => {
        this.$orderInputs.onAmountChange(amount)
      })
    },

    onOrderbookPriceClick(price: string) {
      this.tradingType = TradeExecutionType.LimitFill

      this.$nextTick(() => {
        this.$orderInputs.onPriceChange(price)
      })
    },

    updatePriceFromLastTradedPrice() {
      const { lastTradedPrice, market } = this

      if (!market) {
        return
      }

      this.form.price = lastTradedPrice.toFixed(market.priceDecimals)
    },

    submitLimitOrder() {
      const {
        orderTypeToSubmit,
        market,
        notionalWithLeverageBasedOnWorstPrice,
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
          margin: notionalWithLeverageBasedOnWorstPrice,
          orderType: orderTypeToSubmit,
          reduceOnly: orderTypeReduceOnly,
          quantity: amount
        })
        .then(() => {
          this.$toast.success(this.$t('trade.order_placed'))
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
        notionalWithLeverageBasedOnWorstPrice,
        worstPrice,
        amount
      } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .submitMarketOrder({
          orderType,
          margin: notionalWithLeverageBasedOnWorstPrice,
          reduceOnly: orderTypeReduceOnly,
          price: worstPrice,
          quantity: amount
        })
        .then(() => {
          this.$toast.success(this.$t('trade.trade_placed'))
          this.$set(this, 'form', initialForm())
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    onSubmit() {
      const { tradingTypeMarket } = this

      return tradingTypeMarket
        ? this.submitMarketOrder()
        : this.submitLimitOrder()
    }
  }
})
</script>
