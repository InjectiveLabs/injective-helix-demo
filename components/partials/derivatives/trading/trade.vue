<template>
  <div v-if="market" class="p-4 w-full">
    <div class="w-full flex">
      <v-ui-button-select
        v-model="orderType"
        :option="DerivativeOrderType.Buy"
        half
        primary
      >
        {{ $t('long_asset', { asset: market.baseTokenSymbol }) }}
      </v-ui-button-select>
      <v-ui-button-select
        v-model="orderType"
        :option="DerivativeOrderType.Sell"
        half
        accent
      >
        {{ $t('short_asset', { asset: market.baseTokenSymbol }) }}
      </v-ui-button-select>
    </div>
    <div class="w-full flex mt-4">
      <v-ui-button-select
        v-model="tradingType"
        class="w-1/2"
        :option="TradeExecutionType.Market"
        small
      >
        {{ $t('market') }}
      </v-ui-button-select>
      <v-ui-button-select
        v-model="tradingType"
        class="w-1/2"
        :option="TradeExecutionType.LimitFill"
        small
      >
        {{ $t('limit') }}
      </v-ui-button-select>
    </div>
    <div class="mt-4">
      <div class="mb-4">
        <v-input
          ref="input-amount"
          :value="form.amount"
          :label="$t('amount_decimals', { decimals: market.quantityDecimals })"
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
          <span slot="addon">{{ market.baseTokenSymbol.toUpperCase() }}</span>
          <div
            v-if="false"
            slot="context"
            class="text-xs text-gray-400 flex items-center"
          >
            <span class="mr-1 cursor-pointer" @click.stop="onMaxInput(25)"
              >25%</span
            >
            <span class="mr-1 cursor-pointer" @click.stop="onMaxInput(50)"
              >50%</span
            >
            <span class="mr-1 cursor-pointer" @click.stop="onMaxInput(75)"
              >75%</span
            >
            <span class="cursor-pointer" @click.stop="onMaxInput(100)"
              >100%</span
            >
          </div>
        </v-input>
        <v-ui-text v-if="amountError" semibold accent v-bind="{ '2xs': true }">
          {{ amountError }}
        </v-ui-text>
        <v-ui-text
          v-if="priceError && tradingTypeMarket"
          semibold
          accent
          v-bind="{ '2xs': true }"
        >
          {{ priceError }}
        </v-ui-text>
      </div>
      <div v-if="!tradingTypeMarket" class="mb-4">
        <v-input
          ref="input-price"
          :value="priceInputValue"
          :placeholder="$t('price')"
          :label="
            $t('price_decimals', {
              decimals: market.priceDecimals
            })
          "
          :disabled="tradingTypeMarket"
          type="number"
          :step="priceStep"
          min="0"
          @blur="onPriceBlur"
          @input="onPriceChange"
        >
          <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
        </v-input>
        <v-ui-text v-if="priceError" semibold accent v-bind="{ '2xs': true }">
          {{ priceError }}
        </v-ui-text>
      </div>

      <v-order-leverage
        :leverage="form.leverage"
        :max-leverage="maxLeverageAvailable.toFixed()"
        @change="onLeverageChange"
      />
    </div>
    <component
      :is="tradingTypeMarket ? `v-order-details-market` : 'v-order-details'"
      v-bind="{
        price: executionPrice,
        notionalValue,
        liquidationPrice,
        margin,
        orderType,
        fees,
        total,
        amount,
        detailsDrawerOpen
      }"
      @drawer-toggle="onDetailsDrawerToggle"
    />
    <div class="pt-2">
      <v-ui-button
        :status="status"
        :disabled="hasErrors || !isUserWalletConnected"
        :ghost="hasErrors"
        :primary="!hasErrors && orderType === DerivativeOrderType.Buy"
        :accent="!hasErrors && orderType === DerivativeOrderType.Sell"
        class="uppercase"
        wide
        @click.stop="onSubmit"
      >
        {{ $t('place_order', { type: localizedSubmitOrderType }) }}
      </v-ui-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradeError } from 'types/errors'
import { Status, BigNumberInBase } from '@injectivelabs/utils'
import OrderDetails from './order-details.vue'
import OrderLeverage from './order-leverage.vue'
import OrderDetailsMarket from './order-details-market.vue'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import ButtonCheckbox from '~/components/inputs/button-checkbox.vue'
import {
  DerivativeOrderType,
  TradeExecutionType,
  UiDerivativeOrderbook,
  UiPriceLevel,
  UiDerivativeMarket
} from '~/types'
import {
  calculateWorstExecutionPriceFromOrderbook,
  calculateLiquidationPrice,
  calculateMargin
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
    'v-order-details-market': OrderDetailsMarket
  },

  data() {
    return {
      TradeExecutionType,
      DerivativeOrderType,
      tradingType: TradeExecutionType.Market,
      orderType: DerivativeOrderType.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    orderbook(): UiDerivativeOrderbook | undefined {
      return this.$accessor.derivatives.orderbook
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
      const { amount } = this

      return !amount.isNaN() && amount.gt(0)
    },

    price(): BigNumberInBase {
      return new BigNumberInBase(this.form.price)
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
        price
      } = this

      if (!market) {
        return new BigNumberInBase('')
      }

      if (tradingTypeMarket) {
        if (!hasAmount) {
          return ZERO_IN_BASE
        }

        const records = orderTypeBuy ? sells : buys

        return calculateWorstExecutionPriceFromOrderbook({
          records,
          amount,
          market
        })
      }

      if (price.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(price)
    },

    hasPrice(): boolean {
      const { executionPrice } = this

      return !executionPrice.isNaN() && executionPrice.gt(0)
    },

    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === DerivativeOrderType.Buy
    },

    localizedSubmitOrderType(): string {
      const { tradingType, orderTypeBuy } = this

      if (tradingType === TradeExecutionType.LimitFill) {
        if (orderTypeBuy) {
          return this.$t('limit_long')
        }

        return this.$t('limit_short')
      }

      if (orderTypeBuy) {
        return this.$t('market_long')
      }

      return this.$t('market_short')
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
        return '0.' + '0'.repeat(decimalsAllowed.toNumber() - 2) + '1'
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
        return '0.' + '0'.repeat(decimalsAllowed.toNumber() - 2) + '1'
      }

      return '1'
    },

    availableBalanceError(): TradeError | undefined {
      return undefined // TODO
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

    priceError(): string | null {
      const { price } = this.errors

      return price || null
    },

    amountError(): string | null {
      const { amount } = this.errors

      return amount || null
    },

    errors(): TradeError {
      if (this.availableBalanceError) {
        return this.availableBalanceError
      }

      if (this.amountTooBigToFillError) {
        return this.amountTooBigToFillError
      }

      if (this.notEnoughOrdersToFillFromError) {
        return this.notEnoughOrdersToFillFromError
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

    priceInputValue(): string {
      const { hasPrice, form, tradingTypeMarket } = this

      if (!hasPrice || tradingTypeMarket) {
        return ''
      }

      return form.price
    },

    amountInputValue(): string {
      const { hasAmount, form } = this

      if (!hasAmount) {
        return ''
      }

      return form.amount
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

      return calculateMargin({
        quantity: form.amount,
        price: executionPrice.toFixed(),
        leverage: form.leverage
      })
    },

    notionalValue(): BigNumberInBase {
      const { executionPrice, amount, market } = this

      if (executionPrice.isNaN() || amount.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      const notional = executionPrice.times(amount)

      if (notional.lt(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(notional)
    },

    fees(): BigNumberInBase {
      const { notionalValue, market, tradingTypeMarket } = this

      if (notionalValue.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return notionalValue.times(
        tradingTypeMarket ? market.takerFeeRate : market.makerFeeRate
      )
    },

    total(): BigNumberInBase {
      const { amount, hasPrice, hasAmount, executionPrice, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(executionPrice.times(amount))
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
      const { tradingType, priceInputValue, market } = this

      if (tradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(priceInputValue)
      }
    },

    tradingType(newTradingType: TradeExecutionType) {
      const { priceInputValue, market } = this

      if (newTradingType === TradeExecutionType.LimitFill && market) {
        this.onPriceChange(priceInputValue)
      }
    }
  },

  mounted() {
    this.$root.$on('orderbook-price-click', this.onOrderbookPriceClick)
    this.$root.$on('orderbook-size-click', this.onOrderbookSizeClick)
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
      return percentage.toString()
      /*
      const {
        market,
        fees,
        executionPrice,
        tradingTypeMarket,
        orderTypeBuy,
        orderbook
      } = this
      const percent = new BigNumber(percentage).dividedBy(100)

      return ''

      
      if (!market) {
        return ''
      }

      if (tradingTypeMarket) {
        return getApproxAmountForMarketOrder({
          market,
          leverage,
          availableMargin,
          percent,
          orderbook: orderTypeBuy
            ? [...orderbook.sells].reverse()
            : orderbook.buys
        }).toFixed(market.decimalsAllowed.toNumber(), BigNumber.ROUND_DOWN)
      }

      if (executionPrice.isNaN() || executionPrice.lte(0)) {
        return ''
      }

      return availableMargin
        .minus(fees)
        .times(leverage)
        .dividedBy(executionPrice.times(market.priceFactor))
        .times(percent)
        .toFixed(market.decimalsAllowed.toNumber(), BigNumber.ROUND_DOWN) */
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onOrderbookSizeClick(size: string) {
      this.onAmountChange(size)
    },

    onOrderbookPriceClick(price: string) {
      this.tradingType = TradeExecutionType.LimitFill

      this.$nextTick(() => {
        this.onPriceChange(price)
      })
    },

    onPriceChange(price: string) {
      this.form.price = price
    },

    onPriceBlur() {
      const { market, form, hasPrice } = this

      if (!market || !hasPrice) {
        return
      }

      const roundedPrice = new BigNumberInBase(form.price).toFixed(
        market.priceDecimals
      )

      this.form.price = roundedPrice
    },

    onAmountBlur() {
      const { market, form, amountStep, hasAmount } = this

      if (!market || !hasAmount) {
        return
      }

      const roundedAmount = new BigNumberInBase(form.amount).toFixed(
        market.quantityDecimals
      )

      this.form.amount =
        roundedAmount === '0.0' ? amountStep : roundedAmount || '0'
    },

    onAmountChange(amount: string = '') {
      const { amountStep } = this

      this.form.amount = amount === '0.0' ? amountStep : amount
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
      const { orderType, market, margin, price, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .submitLimitOrder({
          price,
          margin,
          orderType,
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
      const { orderType, market, margin, executionPrice, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .submitMarketOrder({
          orderType,
          margin,
          price: executionPrice,
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

    onSubmit() {
      const { hasErrors, tradingTypeMarket, isUserWalletConnected } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasErrors) {
        return this.$toast.error(this.$t('error_in_form'))
      }

      return tradingTypeMarket
        ? this.submitMarketOrder()
        : this.submitLimitOrder()
    }
  }
})
</script>
