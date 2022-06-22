<template>
  <div v-if="market" class="px-4 w-full">
    <TradingTypeButtons
      :trading-type.sync="tradingType"
      @update:trading-type="resetForm"
    />

    <OrderTypeSelect :order-type.sync="orderType" v-bind="{ market }" />

    <OrderInputs
      ref="orderInputs"
      class="mt-8"
      v-bind="{
        tradingTypeMarket,
        market,
        quoteAvailableBalance,
        sells,
        takerFeeRate,
        hasPrice,
        buys,
        orderTypeBuy,
        baseAvailableBalance,
        executionPrice,
        feeRate,
        amountStep,
        lastTradedPrice,
        totalWithFees,
        hasAmount,
        slippageTolerance: form.slippageTolerance,
        tradingType,
        averagePriceOption
      }"
      :average-price-option.sync="averagePriceOption"
      :amount.sync="form.amount"
      :quote-amount.sync="form.quoteAmount"
      :price.sync="form.price"
      :post-only.sync="form.postOnly"
      :slippage-tolerance.sync="form.slippageTolerance"
      :proportional-percentage.sync="form.proportionalPercentage"
      :has-input-errors.sync="hasInputErrors"
      :has-advanced-settings-errors.sync="hasAdvancedSettingsErrors"
      @update-price-from-last-traded-price="updatePriceFromLastTradedPrice"
    />

    <component
      :is="tradingTypeMarket ? `OrderDetailsMarket` : 'OrderDetails'"
      v-bind="{
        executionPrice,
        orderType,
        makerFeeRate,
        takerFeeRate,
        makerFeeRateDiscount,
        takerFeeRateDiscount,
        orderTypeBuy,
        fees,
        total,
        totalWithFees,
        amount,
        quoteAmount,
        detailsDrawerOpen,
        postOnly: form.postOnly,
        feeRate,
        slippage
      }"
      @drawer-toggle="onDetailsDrawerToggle"
    />

    <OrderSubmit
      v-bind="{
        executionPrice,
        hasInputErrors,
        hasAdvancedSettingsErrors,
        lastTradedPrice,
        market,
        orderType,
        orderTypeBuy,
        status,
        tradingTypeMarket
      }"
      @submit="onSubmit"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  ZERO_IN_BASE,
  UiPriceLevel,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSubaccount,
  SpotOrderSide
} from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import OrderDetails from './order-details.vue'
import OrderDetailsMarket from './order-details-market.vue'
import OrderSubmit from '~/components/partials/common/trade/order-submit.vue'
import OrderInputs from '~/components/partials/common/trade/order-inputs.vue'
import OrderTypeSelect from '~/components/partials/common/trade/order-type-select.vue'
import AdvancedSettings from '~/components/partials/common/trade/advanced-settings/index.vue'
import InputError from '~/components/partials/common/trade/input-error.vue'
import ButtonCheckbox from '~/components/inputs/button-checkbox.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import { AveragePriceOptions } from '~/types'
import {
  calculateAverageExecutionPriceFromFillableNotionalOnOrderBook,
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook
} from '~/app/client/utils/spot'
import TradingTypeButtons from '~/components/partials/common/trade/trading-type-buttons.vue'
import PercentAmountOptions from '~/components/partials/common/trade/percent-amount-options.vue'

interface TradeForm {
  amount: string
  quoteAmount: string
  price: string
  slippageTolerance: string
  postOnly: boolean
  proportionalPercentage: number
}

const initialForm = (): TradeForm => ({
  amount: '',
  quoteAmount: '',
  price: '',
  slippageTolerance: '0.5',
  postOnly: false,
  proportionalPercentage: 0
})

export default Vue.extend({
  components: {
    TradingTypeButtons,
    OrderTypeSelect,
    OrderInputs,
    OrderSubmit,
    ButtonCheckbox,
    OrderDetails,
    OrderDetailsMarket,
    VModalOrderConfirm,
    AdvancedSettings,
    InputError,
    PercentAmountOptions
  },

  data() {
    return {
      TradeExecutionType,
      SpotOrderSide,
      tradingType: TradeExecutionType.LimitFill,
      orderType: SpotOrderSide.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm(),
      hasInputErrors: false,
      hasAdvancedSettingsErrors: false,
      averagePriceOption: AveragePriceOptions.None
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    orderbook(): UiSpotOrderbook | undefined {
      return this.$accessor.spot.orderbook
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
    },

    lastTradedPrice(): BigNumberInBase {
      return this.$accessor.spot.lastTradedPrice
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
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

    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === SpotOrderSide.Buy
    },

    orderTypeToSubmit(): SpotOrderSide {
      const {
        form: { postOnly },
        orderTypeBuy
      } = this

      switch (true) {
        case postOnly && orderTypeBuy: {
          return SpotOrderSide.BuyPO
        }
        case orderTypeBuy: {
          return SpotOrderSide.Buy
        }
        case postOnly && !orderTypeBuy: {
          return SpotOrderSide.SellPO
        }
        case !orderTypeBuy: {
          return SpotOrderSide.Sell
        }
        default: {
          return SpotOrderSide.Buy
        }
      }
    },

    amount(): BigNumberInBase {
      return new BigNumberInBase(this.form.amount)
    },

    quoteAmount(): BigNumberInBase {
      return new BigNumberInBase(this.form.quoteAmount)
    },

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
    },

    baseAvailableBalance(): BigNumberInBase {
      const { subaccount, market } = this

      if (!subaccount || !market) {
        return ZERO_IN_BASE
      }

      const balance = subaccount.balances.find(
        (balance) =>
          balance.denom.toLowerCase() === market.baseDenom.toLowerCase()
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      const baseAvailableBalance = new BigNumberInWei(
        balance.availableBalance || 0
      ).toBase(market.baseToken.decimals)

      if (baseAvailableBalance.isNaN()) {
        return ZERO_IN_BASE
      }

      return baseAvailableBalance
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

    hasPrice(): boolean {
      const { price } = this

      return price.gt(0)
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

    averagePriceDerivedFromBaseAmount(): BigNumberInBase {
      const {
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        amount,
        averagePriceOption,
        baseAvailableBalance,
        form: { proportionalPercentage }
      } = this

      if (!market || !hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const percentBaseBalance = baseAvailableBalance.times(
        proportionalPercentage
      )

      const baseAmountForAveragePrice =
        averagePriceOption === AveragePriceOptions.BaseAmount
          ? amount
          : percentBaseBalance

      return calculateAverageExecutionPriceFromOrderbook({
        records,
        amount: baseAmountForAveragePrice,
        market
      })
    },

    averagePriceDerivedFromQuoteAmount(): BigNumberInBase {
      const {
        orderTypeBuy,
        sells,
        buys,
        market,
        quoteAmount,
        averagePriceOption,
        quoteAvailableBalance,
        form: { proportionalPercentage }
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const records = orderTypeBuy ? sells : buys

      const percentQuoteBalance = quoteAvailableBalance.times(
        proportionalPercentage
      )

      const quoteAmountForAveragePrice =
        averagePriceOption === AveragePriceOptions.QuoteAmount
          ? quoteAmount
          : percentQuoteBalance

      const averagePrice =
        calculateAverageExecutionPriceFromFillableNotionalOnOrderBook({
          records,
          quoteAmount: quoteAmountForAveragePrice,
          market
        })

      if (averagePrice.isNaN()) {
        return ZERO_IN_BASE
      }

      return averagePrice
    },

    averagePrice(): BigNumberInBase {
      const {
        averagePriceDerivedFromBaseAmount,
        averagePriceDerivedFromQuoteAmount,
        averagePriceOption,
        orderTypeBuy
      } = this

      if (averagePriceOption === AveragePriceOptions.BaseAmount) {
        return averagePriceDerivedFromBaseAmount
      }

      if (averagePriceOption === AveragePriceOptions.QuoteAmount) {
        return averagePriceDerivedFromQuoteAmount
      }

      if (averagePriceOption === AveragePriceOptions.Percentage) {
        if (orderTypeBuy) {
          return averagePriceDerivedFromQuoteAmount
        }

        return averagePriceDerivedFromBaseAmount
      }

      return ZERO_IN_BASE
    },

    executionPrice(): BigNumberInBase {
      const { tradingTypeMarket, averagePrice, price } = this

      if (tradingTypeMarket) {
        if (averagePrice.isNaN()) {
          return ZERO_IN_BASE
        }

        return averagePrice
      }

      return price
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

    total(): BigNumberInBase {
      const { hasPrice, hasAmount, executionPrice, market, amount } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return executionPrice.times(amount)
    },

    fees(): BigNumberInBase {
      const { total, feeRate, market } = this

      if (total.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return total.times(feeRate)
    },

    totalWithFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return fees.plus(total)
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
    updatePriceFromLastTradedPrice() {
      const { lastTradedPrice, market } = this

      if (!market) {
        return
      }

      this.form.price = lastTradedPrice.toFixed(market.priceDecimals)
    },

    onOrderbookNotionalClick({
      total,
      price,
      type
    }: {
      total: BigNumberInBase
      price: BigNumberInBase
      type: SpotOrderSide
    }) {
      const { market, slippage } = this

      if (!market) {
        return
      }

      this.tradingType = TradeExecutionType.Market
      this.orderType =
        type === SpotOrderSide.Buy ? SpotOrderSide.Sell : SpotOrderSide.Buy

      const amount = total
        .dividedBy(price.times(slippage).toFixed(market.priceDecimals))
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)

      this.$nextTick(() => {
        this.$orderInputs.onAmountChange(amount)
      })
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onOrderbookSizeClick(size: string) {
      this.$orderInputs.onAmountChange(size)
    },

    onOrderbookPriceClick(price: string) {
      this.tradingType = TradeExecutionType.LimitFill

      this.$nextTick(() => {
        this.$orderInputs.onPriceChange(price)
      })
    },

    resetForm() {
      this.form.amount = ''
      this.form.quoteAmount = ''
      this.form.price = ''
      this.form.quoteAmount = ''
      this.form.proportionalPercentage = 0
    },

    submitLimitOrder() {
      const { orderTypeToSubmit, market, price, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.spot
        .submitLimitOrder({
          price,
          quantity: amount,
          orderType: orderTypeToSubmit
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
      const { orderType, market, worstPrice, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.spot
        .submitMarketOrder({
          quantity: amount,
          price: worstPrice,
          orderType
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
