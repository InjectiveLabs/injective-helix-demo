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
        sells,
        takerFeeRate,
        hasPrice,
        buys,
        orderTypeBuy,
        orderType,
        executionPrice,
        feeRate,
        amountStep,
        lastTradedPrice,
        totalWithFees,
        hasAmount,
        slippageTolerance: form.slippageTolerance,
        tradingType,
        averagePriceOption,
        margin,
        position,
        orderTypeReduceOnly,
        quoteAvailableBalance
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

    <component
      :is="tradingTypeMarket ? `OrderDetailsMarket` : 'OrderDetails'"
      v-bind="{
        price: executionPrice,
        notionalValue,
        liquidationPrice,
        makerExpectedPts,
        takerExpectedPts,
        makerFeeRate,
        takerFeeRate,
        makerFeeRateDiscount,
        takerFeeRateDiscount,
        margin,
        feeReturned,
        feeRebates,
        orderTypeReduceOnly,
        orderType,
        fees,
        total,
        totalWithFees,
        amount,
        detailsDrawerOpen,
        executionPrice,
        postOnly: form.postOnly
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
        reduceOnly: form.reduceOnly,
        showReduceOnly,
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
  UiDerivativeMarketWithToken,
  UiDerivativeOrderbook,
  UiPosition,
  UiPriceLevel,
  ZERO_IN_BASE,
  UiSubaccount
} from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import OrderDetails from './order-details.vue'
import OrderLeverage from './order-leverage.vue'
import OrderLeverageSelect from './order-leverage-select.vue'
import OrderDetailsMarket from './order-details-market.vue'
import OrderTypeSelect from '~/components/partials/common/trade/order-type-select.vue'
import OrderSubmit from '~/components/partials/common/trade/order-submit.vue'
import OrderInputs from '~/components/partials/common/trade/order-inputs.vue'
import TradingTypeButtons from '~/components/partials/common/trade/trading-type-buttons.vue'
import { AveragePriceOptions } from '~/types'
import AdvancedSettings from '~/components/partials/common/trade/advanced-settings/index.vue'
import ButtonCheckbox from '~/components/inputs/button-checkbox.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import {
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook,
  calculateLiquidationPrice,
  calculateMargin,
  calculateAverageExecutionPriceFromFillableNotionalOnOrderBook
} from '~/app/client/utils/derivatives'
import { TradingRewardsCampaign } from '~/app/client/types/exchange'

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
    VButtonCheckbox: ButtonCheckbox,
    OrderDetails,
    OrderLeverage,
    OrderLeverageSelect,
    OrderDetailsMarket,
    OrderInputs,
    OrderTypeSelect,
    OrderSubmit,
    VModalOrderConfirm,
    AdvancedSettings,
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
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
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

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
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
      return new BigNumberInBase(this.form.amount)
    },

    quoteAmount(): BigNumberInBase {
      return new BigNumberInBase(this.form.quoteAmount)
    },

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
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

      if (tradingTypeMarket) {
        return averagePrice
      }

      return price
    },

    hasPrice(): boolean {
      const { price } = this

      return price.gt(0)
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === DerivativeOrderSide.Buy
    },

    orderTypeReduceOnly(): boolean {
      return this.form.reduceOnly && this.showReduceOnly
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

    makerExpectedPts(): BigNumberInBase {
      const { market, makerFeeRate, tradingRewardsCampaign, fees } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (makerFeeRate.lte(0)) {
        return ZERO_IN_BASE
      }

      if (
        !tradingRewardsCampaign ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo
          .disqualifiedMarketIdsList
      ) {
        return ZERO_IN_BASE
      }

      const disqualified =
        tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
          (marketId) => marketId === market.marketId
        )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded =
        tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
          (denom) => denom === market.quoteDenom
        )

      if (!denomIncluded) {
        return ZERO_IN_BASE
      }

      const boostedList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.boostedDerivativeMarketIdsList
        : []
      const multipliersList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.derivativeMarketMultipliersList
        : []

      const boosted = boostedList.findIndex(
        (derivativeMarketId) => derivativeMarketId === market.marketId
      )

      const boostedMultiplier =
        boosted >= 0
          ? cosmosSdkDecToBigNumber(
              multipliersList[boosted]
                ? multipliersList[boosted].makerPointsMultiplier
                : 1
            )
          : 1

      return new BigNumberInBase(fees).times(boostedMultiplier)
    },

    takerExpectedPts(): BigNumberInBase {
      const { market, tradingRewardsCampaign, fees } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (
        !tradingRewardsCampaign ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo ||
        !tradingRewardsCampaign.tradingRewardCampaignInfo
          .disqualifiedMarketIdsList
      ) {
        return ZERO_IN_BASE
      }

      const disqualified =
        tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
          (marketId) => marketId === market.marketId
        )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded =
        tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
          (denom) => denom === market.quoteDenom
        )

      if (!denomIncluded) {
        return ZERO_IN_BASE
      }

      const boostedList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.boostedDerivativeMarketIdsList
        : []
      const multipliersList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.derivativeMarketMultipliersList
        : []

      const boosted = boostedList.findIndex(
        (derivativeMarketId) => derivativeMarketId === market.marketId
      )
      const boostedMultiplier =
        boosted >= 0
          ? cosmosSdkDecToBigNumber(
              multipliersList[boosted]
                ? multipliersList[boosted].takerPointsMultiplier
                : 1
            )
          : 1

      return new BigNumberInBase(fees).times(boostedMultiplier)
    },

    feeReturned(): BigNumberInBase {
      const { notionalValue, takerFeeRate, makerFeeRate } = this

      if (notionalValue.isNaN()) {
        return ZERO_IN_BASE
      }

      return notionalValue.times(
        new BigNumberInBase(takerFeeRate).minus(makerFeeRate)
      )
    },

    feeRebates(): BigNumberInBase {
      const { total, makerFeeRate, market } = this

      if (total.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(total.times(makerFeeRate).abs()).times(
        0.6 /* Only 60% of the fees are getting returned */
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
    resetForm() {
      this.form.amount = ''
      this.form.quoteAmount = ''
      this.form.price = ''
      this.form.quoteAmount = ''
      this.form.proportionalPercentage = 0
      this.form.reduceOnly = false
      this.form.postOnly = false
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onOrderbookSizeClick(size: string) {
      this.$orderInputs.onAmountChange(size)
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
        margin,
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
          margin,
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
