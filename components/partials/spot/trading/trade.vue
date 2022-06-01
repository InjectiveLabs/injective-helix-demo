<template>
  <div v-if="market" class="px-4 w-full">
    <div class="flex items-center justify-center">
      <v-button
        :class="{
          'text-gray-500': tradingType === TradeExecutionType.Market
        }"
        text-xs
        data-cy="trading-page-switch-to-limit-button"
        @click.stop="onTradingTypeToggle(TradeExecutionType.LimitFill)"
      >
        {{ $t('trade.limit') }}
      </v-button>
      <div class="mx-2 w-px h-4 bg-gray-500"></div>
      <v-button
        :class="{
          'text-gray-500': tradingType === TradeExecutionType.LimitFill
        }"
        text-xs
        data-cy="trading-page-switch-to-market-button"
        @click.stop="onTradingTypeToggle(TradeExecutionType.Market)"
      >
        {{ $t('trade.market') }}
      </v-button>
    </div>
    <div class="mt-4">
      <div class="bg-gray-900 rounded-2xl flex">
        <v-button-select
          v-model="orderType"
          :option="postOnly ? SpotOrderSide.BuyPO : SpotOrderSide.Buy"
          aqua
          class="w-1/2"
          data-cy="trading-page-switch-to-side-buy-button"
        >
          {{ $t('trade.buy_asset', { asset: market.baseToken.symbol }) }}
        </v-button-select>
        <v-button-select
          v-model="orderType"
          :option="postOnly ? SpotOrderSide.SellPO : SpotOrderSide.Sell"
          red
          class="w-1/2"
          data-cy="trading-page-switch-to-side-sell-button"
        >
          {{ $t('trade.sell_asset', { asset: market.baseToken.symbol }) }}
        </v-button-select>
      </div>
    </div>
    <div class="mt-8">
      <div>
        <v-input
          v-if="!tradingTypeMarket"
          ref="input-price"
          :key="`price-${priceKey}`"
          v-model="form.price"
          :placeholder="priceStep"
          :label="$t('trade.price')"
          :disabled="tradingTypeMarket"
          type="number"
          :step="priceStep"
          :max-decimals="market ? market.quoteToken.decimals : 6"
          min="0"
          data-cy="trading-page-price-input"
          @input="onPriceChange"
          @blur="onPriceBlur"
        >
          <span slot="addon">{{ market.quoteToken.symbol.toUpperCase() }}</span>
        </v-input>
        <div class="flex gap-3 mt-6">
          <v-input
            ref="input-amount"
            :key="`amount-${amountKey}`"
            v-model="form.amount"
            :label="$t('trade.amount')"
            :custom-handler="true"
            :max-decimals="market ? market.quantityDecimals : 6"
            :placeholder="amountStep"
            type="number"
            :step="amountStep"
            min="0"
            data-cy="trading-page-amount-input"
            show-addon
            @input="onAmountChange"
            @blur="onAmountBlur"
          >
            <span slot="addon">{{
              market.baseToken.symbol.toUpperCase()
            }}</span>
            <div
              slot="context"
              class="text-xs text-gray-400 flex items-center font-mono"
            ></div>
          </v-input>
          <v-input
            ref="input-amount"
            :key="`quoteAmount-${quoteAmountKey}`"
            v-model="form.quoteAmount"
            :custom-handler="true"
            :max-decimals="market ? market.quantityDecimals : 6"
            :placeholder="amountStep"
            type="number"
            :step="amountStep"
            min="0"
            data-cy="trading-page-amount-input"
            show-prefix
            show-addon
            @input="onQuoteAmountChange"
            @blur="onQuoteAmountBlur"
            @input-max="() => onProportionalQuantitySelected(100)"
          >
            <span slot="prefix">≈</span>
            <span slot="addon">{{
              market.quoteToken.symbol.toUpperCase()
            }}</span>
            <div
              slot="context"
              class="text-xs text-gray-400 flex items-center font-mono"
            >
              <span
                class="mr-1 cursor-pointer"
                @click.stop="onProportionalQuantitySelected(25)"
              >
                25%
              </span>
              <span
                class="mr-1 cursor-pointer"
                @click.stop="onProportionalQuantitySelected(50)"
              >
                50%
              </span>
              <span
                class="mr-1 cursor-pointer"
                @click.stop="onProportionalQuantitySelected(75)"
              >
                75%
              </span>
              <span
                class="cursor-pointer"
                @click.stop="onProportionalQuantitySelected(100)"
              >
                100%
              </span>
            </div>
          </v-input>
        </div>
        <span
          v-if="amountError"
          class="text-2xs font-semibold text-red-500"
          data-cy="trading-page-amount-error-text-content"
        >
          {{ amountError }}
        </span>
        <span
          v-if="priceError"
          data-cy="trading-page-price-error-text-content"
          class="text-2xs font-semibold text-red-500"
        >
          {{ priceError }}
        </span>
      </div>
    </div>
    <div>
      <AdvancedSettings
        :slippage-tolerance="form.slippageTolerance"
        :slippage-warning="slippageWarning"
        :slippage-error="slippageError"
        :trading-type-market="tradingTypeMarket"
        @set-slippage-tolerance="setSlippageTolerance"
        @set-post-only="setPostOnly"
      />
    </div>
    <component
      :is="tradingTypeMarket ? `v-order-details-market` : 'v-order-details'"
      v-bind="{
        averagePrice,
        price: executionPrice,
        orderType,
        makerFeeRate,
        takerFeeRate,
        makerExpectedPts,
        takerExpectedPts,
        makerFeeRateDiscount,
        takerFeeRateDiscount,
        orderTypeBuy,
        fees,
        total,
        totalWithFees,
        totalWithoutFees,
        feeReturned,
        feeRebates,
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
        v-if="!hasEnoughInjForGasOrNotKeplr"
        class="text-2xs text-red-400 mb-4"
      >
        {{ $t('insufficientGas.tradingFormNote') }}
        <a
          :href="hubUrl"
          target="_blank"
          class="flex items-center text-primary-500"
        >
          <span class="mr-1">Injective Hub</span>
          <IconExternalLink class="w-2 h-2" />
        </a>
      </p>

      <v-button
        lg
        :status="status"
        :disabled="
          hasErrors || !isUserWalletConnected || !hasEnoughInjForGasOrNotKeplr
        "
        :ghost="hasErrors"
        :aqua="!hasErrors && orderType === SpotOrderSide.Buy"
        :red="!hasErrors && orderType === SpotOrderSide.Sell"
        class="w-full"
        data-cy="trading-page-execute-button"
        @click.stop="onSubmit"
      >
        {{ $t(orderTypeBuy ? 'trade.buy' : 'trade.sell') }}
      </v-button>
    </div>
    <v-modal-order-confirm @confirmed="submitLimitOrder" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TradeError } from 'types/errors'
import { BigNumberInWei, Status, BigNumberInBase } from '@injectivelabs/utils'
import { TradeExecutionType, Wallet } from '@injectivelabs/ts-types'
import {
  cosmosSdkDecToBigNumber,
  NUMBER_REGEX,
  ZERO_IN_BASE,
  UiPriceLevel,
  UiSpotMarketWithToken,
  UiSpotOrderbook,
  UiSubaccount
} from '@injectivelabs/ui-common'
import { SpotOrderSide } from '@injectivelabs/spot-consumer'
import OrderDetails from './order-details.vue'
import OrderDetailsMarket from './order-details-market.vue'
import AdvancedSettings from './advanced-settings.vue'
import {
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
  calculateAverageExecutionPriceFromFillableNotionalOnOrderBook,
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook,
  getApproxAmountForMarketOrder
} from '~/app/services/spot'
import {
  FeeDiscountAccountInfo,
  TradingRewardsCampaign
} from '~/app/services/exchange'
import { excludedPriceDeviationSlugs } from '~/app/data/market'
import { formatToAllowableDecimals } from '~/app/utils/formatters'

interface TradeForm {
  amount: string
  quoteAmount: string
  price: string
  slippageTolerance: string
  postOnly: boolean
}

const initialForm = (): TradeForm => ({
  amount: '',
  quoteAmount: '',
  price: '',
  slippageTolerance: '0.5',
  postOnly: false
})

export default Vue.extend({
  components: {
    'v-button-checkbox': ButtonCheckbox,
    'v-order-details': OrderDetails,
    'v-order-details-market': OrderDetailsMarket,
    VModalOrderConfirm,
    AdvancedSettings
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
      amountKey: 0,
      quoteAmountKey: 0,
      priceKey: 0
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    hasEnoughInjForGas(): boolean {
      return this.$accessor.bank.hasEnoughInjForGas
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

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

    tradingRewardsCampaign(): TradingRewardsCampaign | undefined {
      return this.$accessor.exchange.tradingRewardsCampaign
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

    quoteAmount(): BigNumberInBase {
      return new BigNumberInBase(this.form.quoteAmount)
    },

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
    },

    slippageWarning(): string {
      const {
        form: { slippageTolerance }
      } = this

      if (
        new BigNumberInBase(slippageTolerance).gt(new BigNumberInBase(5)) &&
        new BigNumberInBase(slippageTolerance).isLessThan(
          new BigNumberInBase(50)
        )
      ) {
        return this.$t('trade.high_slippage_warning')
      }

      if (
        new BigNumberInBase(slippageTolerance).isLessThan(
          new BigNumberInBase(0.05)
        )
      ) {
        return this.$t('trade.low_slippage_tolerance_warning')
      }

      return ''
    },

    hasQuoteAmount(): boolean {
      const { quoteAmount, priceStep } = this

      return (
        !quoteAmount.isNaN() && quoteAmount.gt(0) && quoteAmount.gte(priceStep)
      )
    },

    tradingTypeMarket(): boolean {
      const { tradingType } = this

      return tradingType === TradeExecutionType.Market
    },

    orderTypeBuy(): boolean {
      const { orderType } = this

      return orderType === SpotOrderSide.Buy
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

    postOnly(): boolean {
      return this.form.postOnly
    },

    hasPrice(): boolean {
      const { price } = this

      return price.gt(0)
    },

    averagePriceDerivedFromBaseAmount(): BigNumberInBase {
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        slippage,
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
        const averagePrice = calculateAverageExecutionPriceFromOrderbook({
          records,
          amount,
          market
        })

        return new BigNumberInBase(
          averagePrice
            .times(slippage)
            .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
        )
      }

      if (price.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(price).toFixed(
          market.priceDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      )
    },

    averagePriceDerivedFromQuoteAmount(): BigNumberInBase {
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        market,
        slippage,
        quoteAmount,
        price
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (tradingTypeMarket) {
        const records = orderTypeBuy ? sells : buys

        const averagePrice = calculateAverageExecutionPriceFromFillableNotionalOnOrderBook(
          {
            records,
            quoteAmount,
            market
          }
        )

        return new BigNumberInBase(
          averagePrice
            .times(slippage)
            .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
        )
      }

      if (price.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(price).toFixed(
          market.priceDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      )
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
      const {
        tradingTypeMarket,
        orderTypeBuy,
        sells,
        buys,
        hasAmount,
        market,
        slippage,
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
          worstPrice
            .times(slippage)
            .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
        )
      }

      if (price.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(price).toFixed(
          market.priceDecimals,
          BigNumberInBase.ROUND_DOWN
        )
      )
    },

    hasExecutionPrice(): boolean {
      const { executionPrice, priceStep } = this

      return (
        !executionPrice.isNaN() &&
        executionPrice.gt(0) &&
        executionPrice.gte(priceStep)
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

    priceHasHighDeviationWarning(): boolean {
      const {
        price,
        orderTypeBuy,
        tradingTypeMarket,
        market,
        lastTradedPrice
      } = this

      if (!market) {
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

    slippageTooHighError(): TradeError | undefined {
      const {
        form: { slippageTolerance }
      } = this

      if (new BigNumberInBase(slippageTolerance).gt(new BigNumberInBase(50))) {
        return { slippage: this.$t('trade.invalid_slippage') }
      }

      return undefined
    },

    availableBalanceError(): TradeError | undefined {
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        totalWithFees,
        amount,
        hasAmount,
        orderTypeBuy
      } = this

      if (orderTypeBuy) {
        if (quoteAvailableBalance.lt(totalWithFees)) {
          return {
            price: this.$t('trade.not_enough_balance')
          }
        }

        return undefined
      }

      if (!hasAmount) {
        return undefined
      }

      if (baseAvailableBalance.lt(amount)) {
        return {
          amount: this.$t('trade.not_enough_balance')
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
        quoteAmount,
        hasAmount,
        hasQuoteAmount
      } = this

      if (!tradingTypeMarket || (!hasAmount && !hasQuoteAmount)) {
        return
      }

      const orders = orderTypeBuy ? sells : buys

      if (orders.length <= 0 && (amount.gt(0) || quoteAmount.gt(0))) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders')
        }
      }

      return undefined
    },

    amountTooBigToFillError(): TradeError | undefined {
      const {
        tradingTypeMarket,
        hasExecutionPrice,
        hasAmount,
        orderTypeBuy,
        sells,
        buys,
        amount,
        market
      } = this

      if (!tradingTypeMarket || !hasExecutionPrice || !hasAmount || !market) {
        return
      }

      const orders = orderTypeBuy ? sells : buys
      const totalAmount = orders.reduce((totalAmount, { quantity }) => {
        return totalAmount.plus(
          new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
        )
      }, ZERO_IN_BASE)

      if (totalAmount.lt(amount)) {
        return {
          amount: this.$t('trade.not_enough_fillable_orders')
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

    amountNotValidNumberError(): TradeError | undefined {
      const { form } = this

      if (!Number(form.amount)) {
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
        hasExecutionPrice,
        hasAmount,
        market,
        sells,
        buys,
        executionPrice
      } = this

      if (tradingTypeMarket || !hasExecutionPrice || !hasAmount || !market) {
        return
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInWei(buy ? buy.price : 0).toBase(
        market.quoteToken.decimals - market.baseToken.decimals
      )
      const lowestSell = new BigNumberInWei(sell ? sell.price : 0).toBase(
        market.quoteToken.decimals - market.baseToken.decimals
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

    hasEnoughInjForGasOrNotKeplr(): boolean {
      const { wallet, hasEnoughInjForGas } = this

      if (wallet !== Wallet.Keplr) {
        return true
      }

      return hasEnoughInjForGas
    },

    priceError(): string | null {
      const { price } = this.errors

      return price || null
    },

    amountError(): string | null {
      const { amount } = this.errors

      return amount || null
    },

    slippageError(): string | null {
      const {
        errors: { slippage }
      } = this

      return slippage || null
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

      if (this.amountNotValidNumberError) {
        return this.amountNotValidNumberError
      }

      if (this.priceNotValidError) {
        return this.priceNotValidError
      }

      if (this.priceHighDeviationFromMidOrderbookPrice) {
        return this.priceHighDeviationFromMidOrderbookPrice
      }

      if (this.slippageTooHighError) {
        return this.slippageTooHighError
      }

      return { price: '', amount: '', slippage: '' }
    },

    hasErrors(): boolean {
      const {
        priceError,
        amountError,
        tradingTypeMarket,
        hasAmount,
        hasExecutionPrice,
        price,
        amount,
        slippageError
      } = this

      if (priceError) {
        return true
      }

      if (amountError) {
        return true
      }

      if (slippageError) {
        return true
      }

      if (!hasAmount) {
        return true
      }

      if (amount.lte(0)) {
        return true
      }

      if (!tradingTypeMarket) {
        if (price.lte(0) || !hasExecutionPrice) {
          return true
        }
      }

      if (!tradingTypeMarket && hasExecutionPrice && price.lte(0)) {
        return true
      }

      return false
    },

    total(): BigNumberInBase {
      const {
        amount,
        hasExecutionPrice,
        hasAmount,
        averagePrice,
        executionPrice,
        market,
        tradingTypeMarket
      } = this

      if (!hasExecutionPrice || !hasAmount || !market) {
        return ZERO_IN_BASE
      }

      return tradingTypeMarket
        ? averagePrice.times(amount)
        : executionPrice.times(amount)
    },

    fees(): BigNumberInBase {
      const { total, takerFeeRate, market } = this

      if (total.isNaN() || !market) {
        return ZERO_IN_BASE
      }

      return total.times(takerFeeRate)
    },

    makerExpectedPts(): BigNumberInBase {
      const { market, makerFeeRate, tradingRewardsCampaign, fees } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (makerFeeRate.lte(0)) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
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
            .tradingRewardBoostInfo.boostedSpotMarketIdsList
        : []
      const multipliersList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.spotMarketMultipliersList
        : []

      const boosted = boostedList.findIndex(
        (spotMarketId) => spotMarketId === market.marketId
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

      if (!tradingRewardsCampaign) {
        return ZERO_IN_BASE
      }

      if (!tradingRewardsCampaign.tradingRewardCampaignInfo) {
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
            .tradingRewardBoostInfo.boostedSpotMarketIdsList
        : []
      const multipliersList = tradingRewardsCampaign.tradingRewardCampaignInfo
        .tradingRewardBoostInfo
        ? tradingRewardsCampaign.tradingRewardCampaignInfo
            .tradingRewardBoostInfo.spotMarketMultipliersList
        : []

      const boosted = boostedList.findIndex(
        (spotMarketId) => spotMarketId === market.marketId
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

    totalWithFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return fees.plus(total)
    },

    totalWithoutFees(): BigNumberInBase {
      const { fees, total, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return total.minus(fees)
    },

    feeReturned(): BigNumberInBase {
      const { total, takerFeeRate, makerFeeRate, market } = this

      if (total.isNaN() || total.lte(0) || !market) {
        return ZERO_IN_BASE
      }

      return total.times(
        new BigNumberInBase(takerFeeRate).minus(makerFeeRate.abs())
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

    lastTradedPrice(newPrice: BigNumberInBase) {
      const {
        form: { price },
        market
      } = this

      if (!market) {
        return
      }

      if (!price) {
        this.form.price = new BigNumberInBase(newPrice).toFixed(
          market.priceDecimals,
          BigNumberInBase.ROUND_DOWN
        )
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
    onProportionalQuantitySelected(percent = 100) {
      this.onAmountChange(
        this.updateBaseAmountForProportionalQuantityBuyOrSellOrder(percent),
        true
      )
      this.$nextTick(() => {
        this.onAmountChange(
          this.updateBaseAmountForProportionalQuantityBuyOrSellOrder(percent),
          true
        )
        this.updateQuoteAmountForProportionalQuantityBuyOrSellOrder(percent)
      })
    },

    setSlippageTolerance(slippage: string) {
      this.form.slippageTolerance = formatToAllowableDecimals(slippage, 2)
    },

    setPostOnly(postOnly: boolean) {
      this.form.postOnly = postOnly
    },

    updateQuoteAmountForProportionalQuantitySell(
      percentToNumber: BigNumberInBase
    ) {
      const {
        baseAvailableBalance,
        slippage,
        market,
        buys,
        averagePrice,
        executionPrice,
        tradingTypeMarket
      } = this

      if (!market) {
        return
      }

      const { totalFillableAmount, totalNotional } = buys.reduce(
        ({ totalFillableAmount, totalNotional }, { quantity, price }) => {
          const orderPrice = new BigNumberInBase(price)
            .times(slippage)
            .toWei(market.baseToken.decimals - market.quoteToken.decimals)

          const orderQuantity = new BigNumberInWei(quantity).toBase(
            market.baseToken.decimals
          )

          return {
            totalFillableAmount: totalFillableAmount.plus(orderQuantity),
            totalNotional: totalNotional.plus(orderQuantity.times(orderPrice))
          }
        },
        { totalFillableAmount: ZERO_IN_BASE, totalNotional: ZERO_IN_BASE }
      )

      const baseBalance = new BigNumberInBase(baseAvailableBalance).times(
        percentToNumber
      )

      const priceForTradingType = tradingTypeMarket
        ? averagePrice
        : executionPrice

      const notionalBalance = baseBalance.times(priceForTradingType)

      if (baseBalance.gt(totalFillableAmount)) {
        return (this.form.quoteAmount = totalNotional.toString())
      }
      return (this.form.quoteAmount = notionalBalance.toString())
    },

    updateQuoteAmountForProportionalQuantityBuy(
      percentToNumber: BigNumberInBase
    ) {
      const {
        quoteAvailableBalance,
        sells,
        slippage,
        takerFeeRate,
        market
      } = this

      if (!market) {
        return
      }

      let totalNotional = ZERO_IN_BASE

      for (const record of sells) {
        const price = new BigNumberInBase(record.price)
          .times(slippage)
          .toWei(market.baseToken.decimals - market.quoteToken.decimals)

        const quantity = new BigNumberInWei(record.quantity).toBase(
          market.baseToken.decimals
        )

        totalNotional = totalNotional.plus(price.times(quantity))
      }

      const totalFees = totalNotional.times(takerFeeRate)
      const total = totalNotional.plus(totalFees)

      const quoteBalance = quoteAvailableBalance.times(percentToNumber)

      if (total.gt(quoteBalance)) {
        return (this.form.quoteAmount = formatToAllowableDecimals(
          quoteBalance.div(takerFeeRate.plus(1)).toString(),
          market.priceDecimals
        ))
      }

      return (this.form.quoteAmount = formatToAllowableDecimals(
        totalNotional.toString(),
        BigNumberInBase.ROUND_DOWN
      ))
    },

    updateQuoteAmountForProportionalQuantityBuyOrSellOrder(percent: number) {
      const { orderTypeBuy } = this

      const percentToNumber = new BigNumberInBase(percent).div(100)

      if (!orderTypeBuy) {
        this.updateQuoteAmountForProportionalQuantitySell(percentToNumber)
      } else {
        this.updateQuoteAmountForProportionalQuantityBuy(percentToNumber)
      }
    },

    updateBaseAmountForProportionalQuantityBuyOrSellOrder(
      percentage: number
    ): string {
      const {
        market,
        buys,
        sells,
        slippage,
        takerFeeRate,
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

      if (!orderTypeBuy) {
        const totalFillableAmount = buys.reduce((totalAmount, { quantity }) => {
          return totalAmount.plus(
            new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
          )
        }, ZERO_IN_BASE)

        const totalBalance = new BigNumberInBase(balance).times(
          percentageToNumber
        )

        const amount = totalFillableAmount.gte(totalBalance)
          ? totalBalance
          : totalFillableAmount

        return amount.toFixed(
          market.quantityDecimals,
          BigNumberInBase.ROUND_FLOOR
        )
      }

      if (tradingTypeMarket) {
        return getApproxAmountForMarketOrder({
          market,
          balance,
          slippage: slippage.toNumber(),
          percent: percentageToNumber.toNumber(),
          records: orderTypeBuy ? sells : buys
        }).toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      }

      if (executionPrice.lte(0)) {
        return ''
      }

      if (balance.lte(0)) {
        return ''
      }

      const fee = new BigNumberInBase(takerFeeRate)

      return new BigNumberInBase(balance)
        .dividedBy(executionPrice.times(fee.plus(1)))
        .times(percentageToNumber)
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
    },

    onDetailsDrawerToggle() {
      this.detailsDrawerOpen = !this.detailsDrawerOpen
    },

    onOrderbookSizeClick(size: string) {
      this.onAmountChange(size)
    },

    updatePriceFromLastTradedPrice() {
      const { lastTradedPrice, market } = this

      if (!market) {
        return
      }

      this.form.price = lastTradedPrice.toFixed(
        market.priceDecimals,
        BigNumberInBase.ROUND_DOWN
      )
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
      const { hasAmount, market } = this

      if (!market) {
        return
      }

      this.form.price = formatToAllowableDecimals(price, market.priceDecimals)

      if (hasAmount) {
        this.updateLimitQuoteAmount()
      }
    },

    onAmountChange(amount: string = '', isMaxInput?: boolean) {
      const { tradingTypeMarket, hasPrice, market } = this

      if (!market) {
        return
      }

      this.form.amount = formatToAllowableDecimals(
        amount,
        market.quantityDecimals
      )

      this.resetQuoteAmount()

      if (!hasPrice) {
        this.updatePriceFromLastTradedPrice()
      }

      if (isMaxInput) {
        return
      }

      if (tradingTypeMarket) {
        return this.updateMarketQuoteAmount()
      }

      this.updateLimitQuoteAmount()
    },

    onAmountBlur() {
      const { market, form } = this

      if (!market) {
        return
      }

      if (form.amount.trim() !== '' && !form.amount.includes('.')) {
        // use key to refresh input field to eliminate potential trailing decimal point
        this.amountKey++

        this.form.amount = new BigNumberInBase(form.amount).toFixed(
          0,
          BigNumberInBase.ROUND_DOWN
        )
      }
    },

    onQuoteAmountBlur() {
      const { market, form } = this

      if (!market) {
        return
      }

      if (form.quoteAmount.trim() !== '' && !form.quoteAmount.includes('.')) {
        // use key to refresh input field to eliminate potential trailing decimal point
        this.quoteAmountKey++

        this.form.quoteAmount = new BigNumberInBase(form.quoteAmount).toFixed(
          0,
          BigNumberInBase.ROUND_DOWN
        )
      }
    },

    onPriceBlur() {
      const { market, form } = this

      if (!market) {
        return
      }

      if (form.price.trim() !== '' && !form.price.includes('.')) {
        // use key to refresh input field to eliminate potential trailing decimal point
        this.priceKey++

        this.form.price = new BigNumberInBase(form.price).toFixed(
          0,
          BigNumberInBase.ROUND_DOWN
        )
      }
    },

    onQuoteAmountChange(quoteAmount: string = '') {
      const { tradingTypeMarket, hasPrice, market } = this

      if (!market) {
        return
      }

      this.form.quoteAmount = formatToAllowableDecimals(
        quoteAmount,
        market.priceDecimals
      )

      this.resetBaseAmount()

      if (tradingTypeMarket) {
        return this.updateMarketBaseAmount()
      }

      if (!hasPrice) {
        this.updatePriceFromLastTradedPrice()
      }

      this.updateLimitBaseAmount()
    },

    resetBaseAmount() {
      this.form.amount = ''
    },

    resetQuoteAmount() {
      this.form.quoteAmount = ''
    },

    updateMarketBaseAmount() {
      const { quoteAmount, averagePrice, market } = this

      if (!market) {
        return
      }

      this.form.amount = quoteAmount
        .div(averagePrice)
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    },

    updateLimitBaseAmount() {
      const { quoteAmount, price, market } = this

      if (!market) {
        return
      }

      this.form.amount = quoteAmount
        .div(price)
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
    },

    updateMarketQuoteAmount() {
      const { amount, averagePrice, market } = this

      if (!market) {
        return
      }

      this.form.quoteAmount = amount
        .times(averagePrice)
        .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
    },

    updateLimitQuoteAmount() {
      const { amount, price, market } = this

      if (!market) {
        return
      }

      this.form.quoteAmount = amount
        .times(price)
        .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
    },

    onTradingTypeToggle(selectedTradingType: TradeExecutionType) {
      this.tradingType = selectedTradingType
      this.resetBaseAmount()
      this.resetQuoteAmount()
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
          this.$toast.success(this.$t('trade.order_placed'))
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
        tradingTypeMarket,
        priceHasHighDeviationWarning,
        isUserWalletConnected
      } = this

      if (!isUserWalletConnected) {
        return this.$toast.error(this.$t('please_connect_your_wallet'))
      }

      if (hasErrors) {
        return this.$toast.error(this.$t('trade.error_in_form'))
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
