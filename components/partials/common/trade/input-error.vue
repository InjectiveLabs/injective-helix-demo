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
import {
  DEFAULT_MARKET_PRICE_WARNING_DEVIATION,
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE,
  PRICE_BAND_ENABLED
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<
        UiDerivativeMarketWithToken | UiSpotMarketWithToken
      >,
      required: true
    },

    price: {
      type: Object as PropType<BigNumberInBase>,
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

    quoteAmount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    hasQuoteAmount: {
      type: Boolean,
      required: true
    },

    quoteAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    totalWithFees: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    amount: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    hasAmount: {
      type: Boolean,
      required: true
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
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

      return { price: '', amount: '' }
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
      const { price } = this

      const priceToString = price.toFixed()

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

      if (priceError || amountError || !hasAmount) {
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
    }
  },

  watch: {
    hasErrors(hasErrors: boolean) {
      this.$emit('update-has-input-errors', hasErrors)
    }
  }
})
</script>
