<template>
  <div>
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
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { TradeError } from 'types/errors'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  UiPriceLevel,
  ZERO_IN_BASE,
  NUMBER_REGEX
} from '@injectivelabs/sdk-ui-ts'
import { excludedPriceDeviationSlugs } from '~/app/data/market'
import {
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE,
  PRICE_BAND_ENABLED
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    quoteAvailableBalance: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    market: {
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    lastTradedPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    maxReduceOnly: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    quoteAmount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    hasQuoteAmount: {
      type: Boolean,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    notionalValueWithFees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalWithLeverage: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    notionalWithLeverageAndFees: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    amount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    hasAmount: {
      type: Boolean,
      required: true
    },

    leverage: {
      type: String,
      default: undefined
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    orderTypeReduceOnly: {
      type: Boolean,
      default: false
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    sells: {
      type: Array as PropType<UiPriceLevel[]>,
      required: true
    },

    buys: {
      type: Array as PropType<UiPriceLevel[]>,
      required: true
    },

    hasPrice: {
      type: Boolean,
      required: true
    },

    hasInputErrors: {
      type: Boolean,
      required: true
    }
  },

  computed: {
    isSpot(): boolean {
      return this.$route.name === 'spot-spot'
    },

    marketMarkPrice(): string {
      return this.$accessor.derivatives.marketMarkPrice
    },

    errors(): TradeError {
      if (this.availableMarginError) {
        return this.availableMarginError
      }

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

      if (this.maxLeverageError) {
        return this.maxLeverageError
      }

      if (this.markPriceThresholdError) {
        return this.markPriceThresholdError
      }

      if (this.initialMinMarginRequirementError) {
        return this.initialMinMarginRequirementError
      }

      if (this.reduceOnlyExcessError) {
        return this.reduceOnlyExcessError
      }

      if (this.priceNotValidError) {
        return this.priceNotValidError
      }

      if (this.priceHighDeviationFromMidOrderbookPrice) {
        return this.priceHighDeviationFromMidOrderbookPrice
      }

      return { price: '', amount: '' }
    },

    priceHighDeviationFromMidOrderbookPrice(): TradeError | undefined {
      const {
        isSpot,
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
        isSpot
          ? market.quoteToken.decimals - market.baseToken.decimals
          : market.quoteToken.decimals
      )
      const lowestSell = new BigNumberInWei(sell ? sell.price : 0).toBase(
        isSpot
          ? market.quoteToken.decimals - market.baseToken.decimals
          : market.quoteToken.decimals
      )
      const middlePrice = highestBuy.plus(lowestSell).dividedBy(2)

      if (middlePrice.lte(0) || !PRICE_BAND_ENABLED) {
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

    priceError(): string | null {
      const { price } = this.errors

      return price || null
    },

    amountError(): string | null {
      const { amount } = this.errors

      return amount || null
    },

    availableBalanceError(): TradeError | undefined {
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        notionalValueWithFees,
        amount,
        hasAmount,
        orderTypeBuy
      } = this

      if (!hasAmount) {
        return undefined
      }

      if (orderTypeBuy) {
        if (quoteAvailableBalance.lt(notionalValueWithFees)) {
          return {
            price: this.$t('trade.not_enough_balance')
          }
        }

        return undefined
      }

      if (baseAvailableBalance && baseAvailableBalance.lt(amount)) {
        return {
          amount: this.$t('trade.not_enough_balance')
        }
      }

      return undefined
    },

    availableMarginError(): TradeError | undefined {
      const {
        quoteAvailableBalance,
        orderTypeReduceOnly,
        notionalWithLeverageAndFees
      } = this

      if (orderTypeReduceOnly) {
        return undefined
      }

      if (quoteAvailableBalance.lt(notionalWithLeverageAndFees)) {
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

    initialMinMarginRequirementError(): TradeError | undefined {
      const {
        market,
        notionalWithLeverage,
        hasPrice,
        hasAmount,
        executionPrice,
        amount,
        isSpot
      } = this

      if (isSpot || !market || !hasPrice || !hasAmount) {
        return undefined
      }

      if (excludedPriceDeviationSlugs.includes(market.ticker)) {
        return undefined
      }

      const notionalValueWithMarginRatio = executionPrice
        .times(amount)
        .times((market as UiDerivativeMarketWithToken).initialMarginRatio)

      if (notionalWithLeverage.lte(notionalValueWithMarginRatio)) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
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
        market,
        isSpot
      } = this

      if (!tradingTypeMarket || !hasPrice || !hasAmount || !market) {
        return
      }

      const orders = orderTypeBuy ? sells : buys
      const totalAmount = orders.reduce((totalAmount, { quantity }) => {
        return totalAmount.plus(
          isSpot
            ? new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
            : new BigNumberInBase(quantity)
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
      const { executionPrice } = this

      const priceToString = executionPrice.toFixed()

      if (priceToString) {
        return undefined
      }

      if (NUMBER_REGEX.test(priceToString)) {
        return undefined
      }

      return {
        price: this.$t('trade.not_valid_number')
      }
    },

    amountNotValidNumberError(): TradeError | undefined {
      const { amount } = this

      const amountToString = amount.toFixed()

      if (!Number(amountToString)) {
        return undefined
      }

      if (NUMBER_REGEX.test(amountToString)) {
        return undefined
      }

      return {
        amount: this.$t('trade.not_valid_number')
      }
    },

    maxLeverageError(): TradeError | undefined {
      const {
        executionPrice,
        orderTypeBuy,
        hasPrice,
        market,
        marketMarkPrice,
        leverage,
        isSpot
      } = this

      if (isSpot || !hasPrice || !market) {
        return
      }

      const leverageToBigNumber = new BigNumberInBase(leverage)

      const priceWithMarginRatio = new BigNumberInBase(marketMarkPrice).times(
        (market as UiDerivativeMarketWithToken).initialMarginRatio
      )

      const priceBasedOnOrderType = orderTypeBuy
        ? priceWithMarginRatio.minus(marketMarkPrice).plus(executionPrice)
        : priceWithMarginRatio.plus(marketMarkPrice).minus(executionPrice)

      const maxLeverage = executionPrice.dividedBy(priceBasedOnOrderType)

      if (maxLeverage.gte(1) && leverageToBigNumber.gt(maxLeverage)) {
        return {
          price: leverageToBigNumber.eq(1)
            ? orderTypeBuy
              ? this.$t('trade.order_price_high_warn')
              : this.$t('trade.order_price_low_warn')
            : this.$t('trade.max_leverage_warn')
        }
      }

      return undefined
    },

    markPriceThresholdError(): TradeError | undefined {
      const {
        market,
        marketMarkPrice,
        orderTypeBuy,
        notionalWithLeverage,
        hasPrice,
        hasAmount,
        executionPrice,
        amount,
        isSpot
      } = this

      if (isSpot || !marketMarkPrice || !market || !hasPrice || !hasAmount) {
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
      const notionalBasedOnOrderType = orderTypeBuy
        ? notionalWithLeverage.minus(notional)
        : notionalWithLeverage.plus(notional)
      const amountWithInitialMarginRatio = amount.times(
        orderTypeBuy
          ? new BigNumberInBase(
              (market as UiDerivativeMarketWithToken).initialMarginRatio
            ).minus(1)
          : new BigNumberInBase(1).plus(
              (market as UiDerivativeMarketWithToken).initialMarginRatio
            )
      )
      const priceBasedOnNotionalAndMarginRatio = notionalBasedOnOrderType.div(
        amountWithInitialMarginRatio
      )

      if (orderTypeBuy && markPrice.lt(priceBasedOnNotionalAndMarginRatio)) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
        }
      }

      if (!orderTypeBuy && markPrice.gt(priceBasedOnNotionalAndMarginRatio)) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
        }
      }

      return undefined
    },

    reduceOnlyExcessError(): TradeError | undefined {
      const { maxReduceOnly, orderTypeReduceOnly, amount, isSpot } = this

      if (isSpot) {
        return
      }

      if (
        orderTypeReduceOnly &&
        new BigNumberInBase(amount).gt(maxReduceOnly)
      ) {
        return {
          amount: this.$t('trade.reduce_only_in_excess')
        }
      }

      return undefined
    },

    hasErrors(): boolean {
      const {
        priceError,
        amountError,
        tradingTypeMarket,
        hasAmount,
        hasPrice,
        executionPrice,
        amount
      } = this

      if (priceError || amountError || !hasAmount) {
        return true
      }

      if (amount.lte(0)) {
        return true
      }

      if (!tradingTypeMarket) {
        if (executionPrice.lte(0) || !hasPrice) {
          return true
        }
      }

      if (!tradingTypeMarket && hasPrice && executionPrice.lte(0)) {
        return true
      }

      return false
    }
  },

  watch: {
    hasErrors(hasErrors: boolean) {
      this.$emit('update:hasInputErrors', hasErrors)
    }
  }
})
</script>
