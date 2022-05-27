<template>
  <div class="mt-6 flex flex-col">
    <div class="flex items-start justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.swap.rate') }}
      </span>
      <span v-if="pending" class="text-sm">
        {{ $t('trade.swap.fetching_price') }}...
      </span>
      <span v-else-if="hasAmount" class="text-sm">
        1 {{ fromToken.symbol }} = {{ rateToFormat }} {{ toToken.symbol }}
      </span>
      <span v-else class="text-sm"> -- </span>
    </div>
    <div class="flex items-center justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.swap.fee') }} 0.12%
      </span>
      <span v-if="hasAmount" class="text-sm">
        ≈ {{ fee }} {{ toToken.symbol }}
      </span>
      <span v-else class="text-sm"> -- </span>
    </div>
    <div class="flex items-center justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.swap.price_impact') }}
      </span>
      <span v-if="hasAmount" class="text-sm">
        ≈ {{ priceImpactToFormat }}%
      </span>
      <span v-else class="text-sm"> -- </span>
    </div>
    <div class="flex items-center justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.swap.minimum_received') }}
      </span>
      <span v-if="hasAmount" class="text-sm">
        {{ minimumReceivedToFormat }} {{ toToken.symbol }}
      </span>
      <span v-else class="text-sm"> -- </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  cosmosSdkDecToBigNumber,
  SpotOrderSide,
  UiPriceLevel,
  UiSpotOrderbook,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { UI_DEFAULT_PRICE_DISPLAY_DECIMALS } from '~/app/utils/constants'
import {
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook
} from '~/app/services/spot'
import { FeeDiscountAccountInfo } from '~/app/services/exchange'

const ONE_IN_BASE = new BigNumberInBase(1)

export default Vue.extend({
  props: {
    fromToken: {
      type: Object,
      required: true
    },

    toToken: {
      type: Object,
      required: true
    },

    amount: {
      type: BigNumberInBase,
      required: true
    },

    market: {
      type: Object,
      required: true
    },

    calculateExecutionPriceForAmount: {
      type: Function,
      required: true
    },

    orderType: {
      type: String,
      required: true
    },

    slippage: {
      type: BigNumberInBase,
      required: true
    },

    pending: {
      type: Boolean,
      default: false
    }
  },

  computed: {
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

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
    },

    rate(): BigNumberInBase {
      return this.calculateExecutionPriceForAmount(ONE_IN_BASE)
    },

    rateToFormat(): string {
      const { rate } = this

      return rate.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
    },

    fee(): string {
      const {
        amount,
        executionPrice,
        takerFeeRate,
        takerFeeRateDiscount,
        market
      } = this

      const decimalPlaces = market
        ? market.priceDecimals
        : UI_DEFAULT_PRICE_DISPLAY_DECIMALS

      if (amount.isNaN()) {
        return ZERO_IN_BASE.toFormat(decimalPlaces)
      }

      const discount = new BigNumberInBase(1).minus(takerFeeRateDiscount)

      return executionPrice
        .times(amount)
        .times(takerFeeRate)
        .times(discount)
        .toFormat(decimalPlaces)
    },

    executionPrice(): BigNumberInBase {
      const {
        orderType,
        sells,
        buys,
        hasAmount,
        market,
        slippage,
        amount
      } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (!hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderType === SpotOrderSide.Buy ? sells : buys
      const worstPrice = calculateWorstExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(
        worstPrice.times(slippage).toFixed(market.priceDecimals)
      )
    },

    orderbook(): UiSpotOrderbook | undefined {
      return this.$accessor.spot.orderbook
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

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    priceImpact(): BigNumberInBase {
      const { averagePrice, worstPrice } = this

      if (averagePrice.eq(worstPrice)) {
        return ZERO_IN_BASE
      }

      // |avg_price - worst_price| * 100 / avg_price
      return averagePrice.minus(worstPrice).times(100).dividedBy(averagePrice)
    },

    priceImpactToFormat(): string {
      const { priceImpact } = this

      return priceImpact.toFormat(2)
    },

    averagePrice(): BigNumberInBase {
      const {
        orderType,
        sells,
        buys,
        hasAmount,
        market,
        slippage,
        amount
      } = this

      if (!market || !hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderType === SpotOrderSide.Buy ? sells : buys
      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(
        averagePrice.times(slippage).toFixed(market.priceDecimals)
      )
    },

    worstPrice(): BigNumberInBase {
      const {
        orderType,
        slippage,
        sells,
        buys,
        hasAmount,
        market,
        amount
      } = this

      if (!market || !hasAmount) {
        return ZERO_IN_BASE
      }

      const records = orderType === SpotOrderSide.Buy ? sells : buys
      const worstPrice = calculateWorstExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(
        worstPrice.times(slippage).toFixed(market.priceDecimals)
      )
    },

    minimumReceived(): BigNumberInBase {
      const {
        averagePrice,
        orderType,
        takerFeeRate,
        slippage,
        hasAmount,
        amount
      } = this

      if (!hasAmount) {
        return ZERO_IN_BASE
      }

      const slippageTolerance = ONE_IN_BASE.minus(slippage)
      const orderTypeBuy = orderType === SpotOrderSide.Buy

      const slippageFactor = orderTypeBuy
        ? ONE_IN_BASE.plus(slippageTolerance)
        : ONE_IN_BASE.minus(slippageTolerance)
      const fee = orderTypeBuy
        ? ONE_IN_BASE.plus(takerFeeRate)
        : ONE_IN_BASE.minus(takerFeeRate)
      const averagePriceWithSlippageAndFee = averagePrice
        .times(slippageFactor)
        .times(fee)

      return orderTypeBuy
        ? amount.dividedBy(averagePriceWithSlippageAndFee)
        : amount.times(averagePriceWithSlippageAndFee)
    },

    minimumReceivedToFormat(): string {
      const { minimumReceived } = this

      return minimumReceived.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
    }
  }
})
</script>
