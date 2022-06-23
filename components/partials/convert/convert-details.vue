<template>
  <div class="mt-6 flex flex-col">
    <div class="flex items-start justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.convert.rate') }}
      </span>
      <span v-if="pending" class="text-sm">
        {{ $t('trade.convert.fetching_price') }}...
      </span>
      <span v-else-if="hasAmount" class="text-sm">
        1 {{ fromToken.symbol }} ≈ {{ averagePriceWithoutSlippageToFormat }}
        {{ toToken.symbol }}
      </span>
      <span v-else class="text-sm"> -- </span>
    </div>
    <div class="flex items-center justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.convert.fee') }} {{ feeRateToFormat }}%
      </span>
      <span v-if="hasAmount" class="text-sm">
        ≈ {{ feeToFormat }} {{ market.quoteToken.symbol }}
      </span>
      <span v-else class="text-sm"> -- </span>
    </div>
    <!-- <div class="flex items-center justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.convert.estimated_slippage') }}
      </span>
      <span v-if="hasAmount" class="text-sm">
        ≈ {{ estimatedSlippageToFormat }}%
      </span>
      <span v-else class="text-sm"> -- </span>
    </div> -->
    <div class="flex items-center justify-between my-1">
      <span class="text-gray-500 uppercase tracking-widest font-bold text-xs">
        {{ $t('trade.convert.minimum_received') }}
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
  SpotOrderSide,
  UiPriceLevel,
  UiSpotOrderbook,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  cosmosSdkDecToBigNumber,
  FeeDiscountAccountInfo
} from '@injectivelabs/sdk-ts'
import {
  ONE_IN_BASE,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import {
  calculateAverageExecutionPriceFromOrderbook,
  calculateWorstExecutionPriceFromOrderbook
} from '~/app/client/utils/spot'

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

    fee: {
      type: BigNumberInBase,
      required: true
    },

    market: {
      type: Object,
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

    fromAmount: {
      type: String,
      required: true
    },

    toAmount: {
      type: String,
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

    amount(): BigNumberInBase {
      const { orderType, fromAmount, toAmount } = this

      const fromAmountAsNumber =
        fromAmount === '' ? ZERO_IN_BASE : new BigNumberInBase(fromAmount)

      const toAmountAsNumber =
        toAmount === '' ? ZERO_IN_BASE : new BigNumberInBase(toAmount)

      return orderType === SpotOrderSide.Buy
        ? toAmountAsNumber
        : fromAmountAsNumber
    },

    hasAmount(): boolean {
      const { amount, amountStep } = this

      return !amount.isNaN() && amount.gt(0) && amount.gte(amountStep)
    },

    feeRate(): BigNumberInBase {
      const { takerFeeRate, takerFeeRateDiscount } = this

      return takerFeeRate.times(ONE_IN_BASE.minus(takerFeeRateDiscount))
    },

    feeRateToFormat(): string {
      const { feeRate } = this

      return feeRate.times(100).toFormat()
    },

    feeToFormat(): string {
      const { fee, market } = this

      return fee.toFormat(market.quoteToken.decimals)
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

    estimatedSlippage(): BigNumberInBase {
      const { executionPrice, worstPrice } = this

      if (executionPrice.eq(worstPrice)) {
        return ZERO_IN_BASE
      }

      // abs(execution_price - worst_price) * 100 / execution_price
      return new BigNumberInBase(executionPrice.minus(worstPrice).abs())
        .times(100)
        .dividedBy(executionPrice)
    },

    estimatedSlippageToFormat(): string {
      const { estimatedSlippage } = this

      return estimatedSlippage.toFormat(2)
    },

    executionPrice(): BigNumberInBase {
      const { orderType, sells, buys, hasAmount, market, amount } = this

      const records = orderType === SpotOrderSide.Buy ? sells : buys

      if (!market || !hasAmount || records.length === 0) {
        return ZERO_IN_BASE
      }

      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return new BigNumberInBase(averagePrice.toFixed(market.priceDecimals))
    },

    averagePriceWithoutSlippage(): BigNumberInBase {
      const { orderType, sells, buys, market, hasAmount, amount } = this

      const records = orderType === SpotOrderSide.Buy ? sells : buys

      if (!market || !hasAmount || records.length === 0) {
        return ZERO_IN_BASE
      }

      const averagePrice = calculateAverageExecutionPriceFromOrderbook({
        records,
        amount,
        market
      })

      return orderType === SpotOrderSide.Buy
        ? new BigNumberInBase(
            ONE_IN_BASE.dividedBy(averagePrice).toFixed(market.priceDecimals)
          )
        : new BigNumberInBase(averagePrice.toFixed(market.quantityDecimals))
    },

    averagePriceWithoutSlippageToFormat(): string {
      const { averagePriceWithoutSlippage } = this

      return averagePriceWithoutSlippage.toFormat()
    },

    worstPrice(): BigNumberInBase {
      const { orderType, slippage, sells, buys, hasAmount, market, amount } =
        this

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
        executionPrice,
        orderType,
        feeRate,
        slippage,
        hasAmount,
        amount
      } = this

      if (!hasAmount || executionPrice.eq(ZERO_IN_BASE)) {
        return ZERO_IN_BASE
      }

      const slippageTolerance = ONE_IN_BASE.minus(slippage).abs()

      const orderTypeBuy = orderType === SpotOrderSide.Buy

      const slippageFactor = orderTypeBuy
        ? ONE_IN_BASE.plus(slippageTolerance)
        : ONE_IN_BASE.minus(slippageTolerance)

      return orderTypeBuy
        ? amount.dividedBy(
            executionPrice
              .times(slippageFactor)
              .times(ONE_IN_BASE.plus(feeRate))
          )
        : amount.times(
            executionPrice
              .times(slippageFactor)
              .times(ONE_IN_BASE.minus(feeRate))
          )
    },

    minimumReceivedToFormat(): string {
      const { minimumReceived } = this

      return minimumReceived.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
    }
  }
})
</script>
