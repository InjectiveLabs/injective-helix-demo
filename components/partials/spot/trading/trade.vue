<template>
  <div v-if="market" class="p-4 w-full">
    <div class="w-full flex">
      <v-ui-button-select
        v-model="orderType"
        :option="SpotOrderType.Buy"
        half
        primary
      >
        {{ $t('buy_asset', { asset: market.baseToken.symbol }) }}
      </v-ui-button-select>
      <v-ui-button-select
        v-model="orderType"
        :option="SpotOrderType.Sell"
        half
        accent
      >
        {{ $t('sell_asset', { asset: market.baseToken.symbol }) }}
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
          <span slot="addon">{{ market.baseToken.symbol.toUpperCase() }}</span>
          <div slot="context" class="text-xs text-gray-400 flex items-center">
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
    </div>
    <component
      :is="tradingTypeMarket ? `v-order-details-market` : 'v-order-details'"
      v-bind="{
        price: averageExecutionPrice,
        orderType,
        fees,
        total,
        totalWithFees,
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
        :primary="!hasErrors && orderType === SpotOrderType.Buy"
        :accent="!hasErrors && orderType === SpotOrderType.Sell"
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
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import OrderDetails from './order-details.vue'
import OrderDetailsMarket from './order-details-market.vue'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import ButtonCheckbox from '~/components/inputs/button-checkbox.vue'
import {
  SpotOrderType,
  TradeExecutionType,
  UiSpotOrderbook,
  UiPriceLevel,
  UiSpotMarket,
  UiSubaccount
} from '~/types'
import {
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook,
  getApproxAmountForMarketOrder
} from '~/app/services/spot'

interface TradeForm {
  reduceOnly: boolean
  amount: string
  price: string
}

const initialForm = (): TradeForm => ({
  reduceOnly: false,
  amount: '',
  price: ''
})

export default Vue.extend({
  components: {
    'v-button-checkbox': ButtonCheckbox,
    'v-order-details': OrderDetails,
    'v-order-details-market': OrderDetailsMarket
  },

  data() {
    return {
      TradeExecutionType,
      SpotOrderType,
      tradingType: TradeExecutionType.Market,
      orderType: SpotOrderType.Buy,
      detailsDrawerOpen: true,
      status: new Status(),
      form: initialForm()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    orderbook(): UiSpotOrderbook | undefined {
      return this.$accessor.spot.orderbook
    },

    subaccount(): UiSubaccount | undefined {
      return this.$accessor.account.subaccount
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

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        market.baseToken.decimals
      )
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
        return ZERO_IN_BASE
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

    averageExecutionPrice(): BigNumberInBase {
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
        return ZERO_IN_BASE
      }

      if (tradingTypeMarket) {
        if (!hasAmount) {
          return ZERO_IN_BASE
        }

        const records = orderTypeBuy ? sells : buys

        return calculateAverageExecutionPriceFromOrderbook({
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

      return orderType === SpotOrderType.Buy
    },

    localizedSubmitOrderType(): string {
      const { tradingType, orderTypeBuy } = this

      if (tradingType === TradeExecutionType.LimitFill) {
        if (orderTypeBuy) {
          return this.$t('limit_buy')
        }

        return this.$t('limit_sell')
      }

      if (orderTypeBuy) {
        return this.$t('market_buy')
      }

      return this.$t('market_sell')
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
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        totalWithFees,
        orderTypeBuy
      } = this

      if (orderTypeBuy) {
        if (quoteAvailableBalance.lt(totalWithFees)) {
          return {
            price: this.$t('not_enough_balance')
          }
        }

        return undefined
      }

      if (baseAvailableBalance.lt(totalWithFees)) {
        return {
          amount: this.$t('not_enough_balance')
        }
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
        return totalAmount.plus(new BigNumberInWei(quantity).toBase())
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

    total(): BigNumberInBase {
      const { amount, hasPrice, hasAmount, executionPrice, market } = this

      if (!hasPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return executionPrice.times(amount)
    },

    fees(): BigNumberInBase {
      const { total, market, tradingTypeMarket } = this

      if (total.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return total.times(
        tradingTypeMarket ? market.takerFeeRate : market.makerFeeRate
      )
    },

    totalWithFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return fees.plus(total)
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
      const {
        market,
        buys,
        sells,
        tradingTypeMarket,
        orderTypeBuy,
        baseAvailableBalance,
        quoteAvailableBalance,
        executionPrice
      } = this
      const percentageToNumber = new BigNumberInBase(percentage).div(100)
      const balance = orderTypeBuy
        ? quoteAvailableBalance
        : baseAvailableBalance

      if (!market) {
        return ''
      }

      if (tradingTypeMarket) {
        return getApproxAmountForMarketOrder({
          market,
          balance,
          percent: percentageToNumber.toNumber(),
          records: orderTypeBuy ? [...sells].reverse() : buys
        }).toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
      }

      if (executionPrice.lte(0)) {
        return ''
      }

      if (balance.lte(0)) {
        return ''
      }

      const [lowestSellRecord] = sells
      const [highestBuyRecord] = buys
      const lowestSell = lowestSellRecord
        ? new BigNumberInBase(
            new BigNumberInBase(lowestSellRecord.price).toWei(
              market.baseToken.decimals - market.quoteToken.decimals
            )
          )
        : ZERO_IN_BASE
      const highestBuy = lowestSellRecord
        ? new BigNumberInBase(
            new BigNumberInBase(highestBuyRecord.price).toWei(
              market.baseToken.decimals - market.quoteToken.decimals
            )
          )
        : ZERO_IN_BASE

      const fee = new BigNumberInBase(
        orderTypeBuy
          ? executionPrice.gte(lowestSell)
            ? market.takerFeeRate
            : market.makerFeeRate
          : executionPrice.lte(highestBuy)
          ? market.takerFeeRate
          : market.makerFeeRate
      )

      return new BigNumberInBase(balance)
        .dividedBy(executionPrice.times(fee.plus(1)))
        .times(percentageToNumber)
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
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

    submitLimitOrder() {
      const { orderType, market, price, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.spot
        .submitLimitOrder({
          price,
          quantity: amount,
          orderType
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
      const { orderType, market, executionPrice, amount } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.spot
        .submitMarketOrder({
          quantity: amount,
          price: executionPrice,
          orderType
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
