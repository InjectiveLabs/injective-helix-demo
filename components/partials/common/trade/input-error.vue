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
    <PercentWarning
      v-if="potentiallyShowPercentageWarning && !hasPriceOrAmountError"
      v-bind="{
        baseAvailableBalance,
        buys,
        inputProportionalPercentage,
        isSpot,
        market,
        orderTypeBuy,
        quoteAvailableBalance,
        sells
      }"
      data-cy="trading-page-percent-warning-text-content"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  UiPriceLevel,
  ZERO_IN_BASE,
  UiPerpetualMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  MarketType
} from '@injectivelabs/sdk-ui-ts'
import { TradeError } from '~/types'
import { excludedPriceDeviationSlugs } from '~/app/data/market'
import {
  DEFAULT_MAX_PRICE_BAND_DIFFERENCE,
  DEFAULT_MIN_PRICE_BAND_DIFFERENCE,
  PRICE_BAND_ENABLED
} from '~/app/utils/constants'
import PercentWarning from '~/components/partials/common/trade/percent-warning.vue'

export default Vue.extend({
  components: {
    PercentWarning
  },

  props: {
    quoteAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    market: {
      type: Object as PropType<
        | UiSpotMarketWithToken
        | UiPerpetualMarketWithToken
        | UiExpiryFuturesMarketWithToken
      >,
      required: true
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    worstPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    triggerPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    lastTradedPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    markPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    maxReduceOnly: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    potentiallyShowPercentageWarning: {
      type: Boolean,
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

    inputProportionalPercentage: {
      type: Number,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    notionalValueWithFees: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    notionalWithLeverage: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    notionalWithLeverageBasedOnWorstPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
    },

    notionalWithLeverageAndFees: {
      type: Object as PropType<BigNumberInBase>,
      default: () => ZERO_IN_BASE
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
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeLimit: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeStopMarket: {
      type: Boolean as PropType<boolean>,
      required: true
    },

    tradingTypeStopLimit: {
      type: Boolean as PropType<boolean>,
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

  data() {
    return {
      MarketType
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

      if (this.emptyOrderbookWithAmountInput) {
        return this.emptyOrderbookWithAmountInput
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

      if (this.priceHighDeviationFromMidOrderbookPrice) {
        return this.priceHighDeviationFromMidOrderbookPrice
      }

      if (this.triggerPriceEqualsZero) {
        return this.triggerPriceEqualsZero
      }

      if (this.triggerPriceEqualsMarkPrice) {
        return this.triggerPriceEqualsMarkPrice
      }

      return { price: '', amount: '' }
    },

    triggerPriceEqualsMarkPrice(): TradeError | undefined {
      const { tradingTypeMarket, tradingTypeLimit, triggerPrice, markPrice } =
        this

      if (tradingTypeMarket || tradingTypeLimit) {
        return
      }

      if (triggerPrice === undefined || !triggerPrice.eq(markPrice)) {
        return
      }

      return {
        price: this.$t('trade.trigger_price_equals_mark_price')
      }
    },

    triggerPriceEqualsZero(): TradeError | undefined {
      const { tradingTypeMarket, tradingTypeLimit, triggerPrice } = this

      if (tradingTypeMarket || tradingTypeLimit) {
        return
      }

      if (triggerPrice === undefined || triggerPrice.gt(ZERO_IN_BASE)) {
        return
      }

      return {
        price: this.$t('trade.trigger_price_zero')
      }
    },

    priceHighDeviationFromMidOrderbookPrice(): TradeError | undefined {
      const {
        isSpot,
        tradingTypeMarket,
        tradingTypeStopLimit,
        tradingTypeStopMarket,
        hasPrice,
        hasAmount,
        market,
        sells,
        buys,
        executionPrice
      } = this

      if (
        tradingTypeMarket ||
        tradingTypeStopMarket ||
        tradingTypeStopLimit ||
        !hasPrice ||
        !hasAmount ||
        !market
      ) {
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

    priceError(): string {
      const { price } = this.errors

      return price || ''
    },

    amountError(): string {
      const { amount } = this.errors

      return amount || ''
    },

    hasPriceOrAmountError(): boolean {
      const { priceError, amountError } = this

      return priceError.length > 0 || amountError.length > 0
    },

    availableBalanceError(): TradeError | undefined {
      const {
        quoteAvailableBalance,
        baseAvailableBalance,
        notionalValueWithFees,
        amount,
        hasAmount,
        orderTypeBuy,
        isSpot
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

      if (isSpot && baseAvailableBalance.lt(amount)) {
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

    emptyOrderbookWithAmountInput(): TradeError | undefined {
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

      if (market.subType === MarketType.BinaryOptions) {
        return
      }

      if (excludedPriceDeviationSlugs.includes(market.ticker)) {
        return undefined
      }

      const initialMarginRatio = (
        market as UiPerpetualMarketWithToken | UiExpiryFuturesMarketWithToken
      ).initialMarginRatio

      const notionalValueWithMarginRatio = executionPrice
        .times(amount)
        .times(initialMarginRatio)

      // console.log('exectionPrice:', executionPrice.toString())
      // console.log('amount:', amount.toString())
      // console.log('initialMarginRatio:', initialMarginRatio.toString())
      // console.log('notionalValueWithMarginRatio:', notionalValueWithMarginRatio.toString())
      // console.log('notionalWithLeverage:', notionalWithLeverage.toString())

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

    maxLeverageError(): TradeError | undefined {
      const {
        executionPrice,
        worstPrice,
        orderTypeBuy,
        hasPrice,
        market,
        marketMarkPrice,
        leverage,
        isSpot,
        tradingTypeMarket
      } = this

      if (isSpot || !hasPrice || !market) {
        return
      }

      const useExecutionPrice = !tradingTypeMarket
      const price = useExecutionPrice ? executionPrice : worstPrice

      const leverageToBigNumber = new BigNumberInBase(leverage)
      const priceWithMarginRatio = new BigNumberInBase(marketMarkPrice).times(
        (market as UiPerpetualMarketWithToken | UiExpiryFuturesMarketWithToken)
          .initialMarginRatio
      )

      const priceBasedOnOrderType = orderTypeBuy
        ? priceWithMarginRatio.minus(marketMarkPrice).plus(price)
        : priceWithMarginRatio.plus(marketMarkPrice).minus(price)

      const maxLeverage = price.dividedBy(priceBasedOnOrderType)

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
        executionPrice,
        market,
        marketMarkPrice,
        orderTypeBuy,
        notionalWithLeverageBasedOnWorstPrice,
        notionalWithLeverage,
        hasPrice,
        hasAmount,
        worstPrice,
        amount,
        isSpot,
        tradingTypeMarket
      } = this

      if (
        isSpot ||
        !marketMarkPrice ||
        !market ||
        !hasPrice ||
        !hasAmount ||
        !worstPrice
      ) {
        return undefined
      }

      if (excludedPriceDeviationSlugs.includes(market.ticker)) {
        return undefined
      }

      if (market.subType === MarketType.BinaryOptions) {
        return undefined
      }

      const useExecutionPrice = !tradingTypeMarket
      const price = useExecutionPrice ? executionPrice : worstPrice
      const notionalWithLeverageBasedOnMarketType = useExecutionPrice
        ? notionalWithLeverage
        : notionalWithLeverageBasedOnWorstPrice

      const marketWithType = market as
        | UiPerpetualMarketWithToken
        | UiExpiryFuturesMarketWithToken

      const markPrice = new BigNumberInBase(marketMarkPrice)

      if (markPrice.lte(0)) {
        return {
          amount: this.$t('trade.mark_price_invalid')
        }
      }

      const notional = price.times(amount)
      const notionalBasedOnOrderType = orderTypeBuy
        ? notionalWithLeverageBasedOnMarketType.minus(notional)
        : notionalWithLeverageBasedOnMarketType.plus(notional)
      const amountWithInitialMarginRatio = amount.times(
        orderTypeBuy
          ? new BigNumberInBase(marketWithType.initialMarginRatio).minus(1)
          : new BigNumberInBase(1).plus(marketWithType.initialMarginRatio)
      )
      const priceBasedOnNotionalAndMarginRatio = notionalBasedOnOrderType.div(
        amountWithInitialMarginRatio
      )

      const isBuyAndMarkPriceLessThanPrice =
        orderTypeBuy && markPrice.lt(priceBasedOnNotionalAndMarginRatio)
      const isSellAndMarkPriceGreaterThanPrice =
        !orderTypeBuy && markPrice.gt(priceBasedOnNotionalAndMarginRatio)

      if (
        isBuyAndMarkPriceLessThanPrice ||
        isSellAndMarkPriceGreaterThanPrice
      ) {
        return {
          amount: this.$t('trade.order_insufficient_margin')
        }
      }

      return undefined
    },

    hasErrors(): boolean {
      const { priceError, amountError } = this

      return !!(priceError || amountError)
    }
  },

  watch: {
    hasErrors(hasErrors: boolean) {
      this.$emit('update:hasInputErrors', hasErrors)
    }
  }
})
</script>
