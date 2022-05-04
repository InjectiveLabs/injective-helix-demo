<template>
  <div v-if="market" class="px-4 w-full">
    <div class="flex items-center justify-center">
      <v-button
        :class="{
          'text-gray-500': tradingType === TradeExecutionType.LimitFill
        }"
        text-xs
        @click.stop="onTradingTypeToggle(TradeExecutionType.Market)"
      >
        {{ $t('trade.market') }}
      </v-button>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button
        sm
        :class="{
          'text-gray-500': tradingType === TradeExecutionType.Market
        }"
        text-xs
        @click.stop="onTradingTypeToggle(TradeExecutionType.LimitFill)"
      >
        {{ $t('trade.limit') }}
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
          {{ $t('trade.buy_asset', { asset: market.baseToken.symbol }) }}
        </v-button-select>
        <v-button-select
          v-model="orderType"
          :option="DerivativeOrderSide.Sell"
          red
          class="w-1/2"
        >
          {{ $t('trade.sell_asset', { asset: market.baseToken.symbol }) }}
        </v-button-select>
      </div>
    </div>
    <div class="mt-8">
      <div>
        <v-input
          ref="input-amount"
          v-model="form.amount"
          :label="$t('trade.amount')"
          :custom-handler="true"
          :max-decimals="market ? market.quantityDecimals : 6"
          :max-selector="true"
          :placeholder="amountStep"
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
        <span
          v-if="amountError"
          class="text-2xs font-semibold text-red-500 leading-1"
        >
          {{ amountError }}
        </span>
        <span
          v-if="priceError && tradingTypeMarket"
          class="text-2xs font-semibold text-red-500 leading-1"
        >
          {{ priceError }}
        </span>
      </div>
      <div v-if="!tradingTypeMarket" class="mt-6">
        <v-input
          ref="input-price"
          v-model="form.price"
          :placeholder="priceStep"
          :label="$t('trade.price')"
          :disabled="tradingTypeMarket"
          type="number"
          :step="priceStep"
          min="0"
          :max-decimals="market ? market.quoteToken.decimals : 6"
          @blur="onPriceBlur"
          @input="onPriceChange"
        >
          <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
        </v-input>
        <span
          v-if="priceError"
          class="text-red-500 font-semibold text-2xs leading-1"
        >
          {{ priceError }}
        </span>
      </div>

      <v-order-leverage
        v-if="!orderTypeReduceOnly"
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
        :title="$t('trade.reduce_only')"
      />
    </div>
    <component
      :is="tradingTypeMarket ? `v-order-details-market` : 'v-order-details'"
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
        detailsDrawerOpen
      }"
      @drawer-toggle="onDetailsDrawerToggle"
    />
    <div>
      <p
        v-if="executionPriceHasHighDeviationWarning && !hasErrors"
        class="text-2xs text-red-200 mb-4"
      >
        {{ $t('trade.execution_price_far_away_from_last_traded_price') }}
      </p>

      <p
        v-if="!hasEnoughInjForGasAndIsUsingKeplr"
        class="text-2xs text-red-400 mb-4"
      >
        {{ $t('insufficientGas.tradingFormNote') }}
        <a
          :href="hubUrl"
          target="_blank"
          class="flex items-center text-primary-500"
        >
          <span class="mr-1">Injective Hub</span>
          <v-icon-external-link class="w-2 h-2" />
        </a>
      </p>

      <v-button
        lg
        :status="status"
        :disabled="
          hasErrors ||
          !isUserWalletConnected ||
          !hasEnoughInjForGasAndIsUsingKeplr
        "
        :ghost="hasErrors"
        :aqua="!hasErrors && orderType === DerivativeOrderSide.Buy"
        :red="!hasErrors && orderType === DerivativeOrderSide.Sell"
        class="w-full"
        @click.stop="onSubmit"
      >
        {{ $t(orderTypeBuy ? 'trade.buy_long' : 'trade.sell_short') }}
      </v-button>
    </div>

    <v-modal-order-confirm @confirmed="submitLimitOrder" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradeError } from 'types/errors'
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
  cosmosSdkDecToBigNumber,
  NUMBER_REGEX,
  ZERO_IN_BASE,
  UiSubaccount
} from '@injectivelabs/ui-common'
import OrderDetails from './order-details.vue'
import OrderLeverage from './order-leverage.vue'
import OrderLeverageSelect from './order-leverage-select.vue'
import OrderDetailsMarket from './order-details-market.vue'
import {
  DEFAULT_MAX_SLIPPAGE,
  DEFAULT_PRICE_WARNING_DEVIATION,
  DEFAULT_MARKET_PRICE_WARNING_DEVIATION,
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE,
  PRICE_BAND_ENABLED,
  BIGGER_PRICE_WARNING_DEVIATION
} from '~/app/utils/constants'
import ButtonCheckbox from '~/components/inputs/button-checkbox.vue'
import VModalOrderConfirm from '~/components/partials/modals/order-confirm.vue'
import { Modal } from '~/types'
import {
  calculateWorstExecutionPriceFromOrderbook,
  calculateLiquidationPrice,
  calculateMargin,
  getApproxAmountForMarketOrder
} from '~/app/services/derivatives'
import {
  TradingRewardsCampaign,
  FeeDiscountAccountInfo
} from '~/app/services/exchange'
import { excludedPriceDeviationSlugs } from '~/app/data/market'

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

    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
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

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
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

      const makerFeeRate = new BigNumberInBase(market.makerFeeRate)
      const takerFeeRate = new BigNumberInBase(market.takerFeeRate)

      if (makerFeeRate.lte(0)) {
        return takerFeeRate
      }

      return new BigNumberInBase(market.takerFeeRate).times(
        new BigNumberInBase(1).minus(takerFeeRateDiscount)
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
        slippage,
        sells,
        buys,
        hasAmount,
        market,
        amount,
        price
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
          amount: this.$t('trade.not_enough_balance')
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

      if (maxLeverage.gte(1) && leverage.gt(maxLeverage)) {
        return {
          price: leverage.eq(1)
            ? orderTypeBuy
              ? this.$t('trade.order_price_high_warn')
              : this.$t('trade.order_price_low_warn')
            : this.$t('trade.max_leverage_warn')
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
          amount: this.$t('trade.reduce_only_in_excess')
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
        return this.$t('trade.you_can_only_have_max_orders', {
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
          amount: this.$t('trade.not_enough_fillable_orders')
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
          amount: this.$t('trade.not_enough_fillable_orders')
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

      if (excludedPriceDeviationSlugs.includes(market.ticker)) {
        return undefined
      }

      const markPrice = new BigNumberInBase(marketMarkPrice)

      if (markPrice.lte(0)) {
        return {
          amount: this.$t('trade.mark_price_invalid')
        }
      }

      const notional = executionPrice.times(amount)
      const dividend = orderTypeBuy
        ? margin.minus(notional)
        : margin.plus(notional)
      const divisor = amount.times(
        orderTypeBuy
          ? new BigNumberInBase(market.initialMarginRatio).minus(1)
          : new BigNumberInBase(1).plus(market.initialMarginRatio)
      )
      const condition = dividend.div(divisor)

      if (orderTypeBuy && markPrice.lt(condition)) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
        }
      }

      if (!orderTypeBuy && markPrice.gt(condition)) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
        }
      }

      return undefined
    },

    initialMinMarginRequirementError(): TradeError | undefined {
      const {
        market,
        margin,
        hasPrice,
        hasAmount,
        executionPrice,
        amount
      } = this

      if (!market || !hasPrice || !hasAmount) {
        return undefined
      }

      if (excludedPriceDeviationSlugs.includes(market.ticker)) {
        return undefined
      }

      const condition = executionPrice
        .times(amount)
        .times(market.initialMarginRatio)

      if (margin.lte(condition)) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
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
        price: this.$t('trade.not_valid_number')
      }
    },

    priceHasHighDeviationWarning(): boolean {
      const {
        price,
        orderTypeBuy,
        tradingTypeMarket,
        orderTypeReduceOnly,
        lastTradedPrice,
        market
      } = this

      if (!market) {
        return false
      }

      if (orderTypeReduceOnly) {
        return false
      }

      if (tradingTypeMarket) {
        return false
      }

      if (price.lte(0)) {
        return false
      }

      const defaultPriceWarningDeviation = excludedPriceDeviationSlugs.includes(
        market.ticker
      )
        ? BIGGER_PRICE_WARNING_DEVIATION
        : DEFAULT_PRICE_WARNING_DEVIATION

      const deviation = new BigNumberInBase(1)
        .minus(
          orderTypeBuy
            ? lastTradedPrice.dividedBy(price)
            : price.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(defaultPriceWarningDeviation)
    },

    executionPriceHasHighDeviationWarning(): boolean {
      const {
        executionPrice,
        orderTypeBuy,
        tradingTypeMarket,
        lastTradedPrice
      } = this

      if (!tradingTypeMarket) {
        return false
      }

      if (executionPrice.lte(0)) {
        return false
      }

      const deviation = new BigNumberInBase(1)
        .minus(
          orderTypeBuy
            ? lastTradedPrice.dividedBy(executionPrice)
            : executionPrice.dividedBy(lastTradedPrice)
        )
        .times(100)

      return deviation.gt(DEFAULT_MARKET_PRICE_WARNING_DEVIATION)
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
        amount: this.$t('trade.not_valid_number')
      }
    },

    priceHighDeviationFromMidOrderbookPrice(): TradeError | undefined {
      const {
        tradingTypeMarket,
        hasPrice,
        hasAmount,
        market,
        sells,
        buys,
        executionPrice
      } = this

      if (tradingTypeMarket || !hasPrice || !hasAmount || !market) {
        return
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInWei(buy ? buy.price : 0).toBase(
        market.quoteToken.decimals
      )
      const lowestSell = new BigNumberInWei(sell ? sell.price : 0).toBase(
        market.quoteToken.decimals
      )
      const middlePrice = highestBuy.plus(lowestSell).dividedBy(2)

      if (middlePrice.lte(0)) {
        return undefined
      }

      if (!PRICE_BAND_ENABLED) {
        return undefined
      }

      const minTickPrice = new BigNumberInBase(
        new BigNumberInBase(1).shiftedBy(-market.priceDecimals)
      )
      const acceptableMax = middlePrice.times(
        DEFAULT_MAX_PRICE_BAND_DIFFERENCE.div(100)
      )
      const acceptableMin = middlePrice.times(
        new BigNumberInBase(1).minus(DEFAULT_MIN_PRICE_BAND_DIFFERENCE.div(100))
      )
      const cappedAcceptableMin = acceptableMin.gt(0)
        ? acceptableMin
        : minTickPrice

      if (
        executionPrice.lt(cappedAcceptableMin) ||
        executionPrice.gt(acceptableMax)
      ) {
        return {
          price: this.$t('trade.your_order_has_high_price_deviation')
        }
      }

      return undefined
    },

    hasEnoughInjForGasAndIsUsingKeplr(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      return wallet === Wallet.Keplr && hasEnoughInjForGas
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

      if (this.priceHighDeviationFromMidOrderbookPrice) {
        return this.priceHighDeviationFromMidOrderbookPrice
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

      if (this.initialMinMarginRequirementError) {
        return this.initialMinMarginRequirementError
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
      const { notionalValue, takerFeeRate } = this

      if (notionalValue.isNaN()) {
        return ZERO_IN_BASE
      }

      return notionalValue.times(takerFeeRate)
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

      const disqualified = tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
        (marketId) => marketId === market.marketId
      )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded = tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
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

      const disqualified = tradingRewardsCampaign.tradingRewardCampaignInfo.disqualifiedMarketIdsList.find(
        (marketId) => marketId === market.marketId
      )

      if (disqualified) {
        return ZERO_IN_BASE
      }

      const denomIncluded = tradingRewardsCampaign.tradingRewardCampaignInfo.quoteDenomsList.find(
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
     * and then we update the amount again to account the fees
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
        takerFeeRate,
        sells,
        form,
        slippage,
        tradingTypeMarket,
        orderTypeBuy,
        position,
        maxReduceOnly,
        orderTypeReduceOnly,
        availableMargin,
        executionPrice
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

      const fee = new BigNumberInBase(takerFeeRate)

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
      this.form.price = price.toString()
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

      if (form.amount.trim() !== '') {
        this.form.amount = new BigNumberInBase(form.amount).toFixed(
          market.quantityDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      }
    },

    onAmountChange(amount: string = '') {
      this.form.amount = amount.toString()
    },

    onTradingTypeToggle(selectedTradingType: TradeExecutionType) {
      this.tradingType = selectedTradingType
    },

    onLeverageChange(leverage: string) {
      const { maxLeverageAvailable } = this
      const leverageToBigNumber = new BigNumberInBase(leverage)

      if (leverageToBigNumber.gte(maxLeverageAvailable)) {
        this.form.leverage = maxLeverageAvailable.toFixed()
      } else if (leverageToBigNumber.lt(1)) {
        this.form.leverage = '1'
      } else {
        this.form.leverage = leverage
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
          this.$toast.success(this.$t('trade.trade_placed'))
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
        priceHasHighDeviationWarning
      } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasErrors) {
        return this.$toast.error(this.$t('trade.error_in_form'))
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
      return this.$accessor.modal.openModal(Modal.OrderConfirm)
    }
  }
})
</script>
