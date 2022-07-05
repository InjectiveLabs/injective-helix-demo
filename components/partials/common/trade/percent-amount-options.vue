<template>
  <div class="text-xs text-gray-400 flex items-center font-mono">
    <span
      v-for="(percent, index) in percentages"
      :key="index"
      class="mr-1 cursor-pointer"
      @click.stop="onPercentAmountSelected(percent)"
    >
      {{ percent }}%
    </span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotMarketWithToken,
  ZERO_IN_BASE,
  UiPriceLevel,
  UiPosition,
  UiDerivativeMarketWithToken,
  UiDerivativeLimitOrder
} from '@injectivelabs/sdk-ui-ts'
import { formatAmountToAllowableDecimals } from '~/app/utils/formatters'
import {
  getSpotBaseAmountForPercentageSell,
  getSpotBaseAmountForPercentageBuy,
  getSpotQuoteForPercentageSell,
  getSpotQuoteForPercentageBuy
} from '~/app/client/utils/spot'
import {
  getApproxAmountForMarketOrder,
  getDerivativesMarketBaseAmountForPercentage,
  getDerivativesLimitBaseAmountForPercentage,
  getDerivativesQuoteAmountForPercentageNonReduceOnly
} from '~/app/client/utils/derivatives'

export default Vue.extend({
  props: {
    market: {
      type: Object as PropType<
        UiSpotMarketWithToken | UiDerivativeMarketWithToken | undefined
      >,
      required: true
    },

    proportionalPercentage: {
      type: Number,
      required: true
    },

    tradingTypeMarket: {
      type: Boolean,
      required: true
    },

    hasPrice: {
      type: Boolean,
      required: true
    },

    maxReduceOnly: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    quoteAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    buys: {
      type: Array as PropType<UiPriceLevel[]>,
      required: true
    },

    sells: {
      type: Array as PropType<UiPriceLevel[]>,
      required: true
    },

    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    executionPrice: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    worstPrice: {
      type: Object as PropType<BigNumberInBase>,
      default: undefined
    },

    feeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    takerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    orderTypeReduceOnly: {
      type: Boolean,
      default: false
    },

    slippage: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    position: {
      type: Object as PropType<UiPosition> | undefined,
      default: undefined
    },

    leverage: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      percentages: [25, 50, 75, 100]
    }
  },

  computed: {
    orders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    isSpot(): boolean {
      return this.$route.name === 'spot-spot'
    },

    maxDerivativesAmountFromPercentage(): string {
      const {
        market,
        buys,
        takerFeeRate,
        sells,
        proportionalPercentage,
        slippage,
        leverage,
        tradingTypeMarket,
        orderTypeBuy,
        position,
        maxReduceOnly,
        orderTypeReduceOnly,
        quoteAvailableBalance,
        executionPrice,
        isSpot
      } = this

      if (!market || isSpot) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      if (orderTypeReduceOnly && position) {
        return maxReduceOnly
          .times(percentageToNumber)
          .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      }

      if (tradingTypeMarket) {
        return getApproxAmountForMarketOrder({
          market: market as UiDerivativeMarketWithToken,
          margin: quoteAvailableBalance,
          leverage,
          slippage: slippage.toNumber(),
          percent: percentageToNumber.toNumber(),
          records: orderTypeBuy ? sells : buys
        }).toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
      }

      if (executionPrice.lte(0)) {
        return ''
      }

      if (quoteAvailableBalance.lte(0)) {
        return ''
      }

      const fee = new BigNumberInBase(takerFeeRate)

      return new BigNumberInBase(quoteAvailableBalance)
        .times(leverage)
        .dividedBy(executionPrice.times(fee.times(leverage).plus(1)))
        .times(percentageToNumber)
        .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_FLOOR)
    },

    defaultDerivativesAmountFromPercentage(): string {
      const {
        market,
        buys,
        sells,
        orderTypeBuy,
        quoteAvailableBalance,
        executionPrice,
        slippage,
        proportionalPercentage,
        feeRate,
        leverage,
        tradingTypeMarket,
        isSpot
      } = this

      if (!market || isSpot) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      if (tradingTypeMarket) {
        return getDerivativesMarketBaseAmountForPercentage({
          records: orderTypeBuy ? sells : buys,
          quoteAvailableBalance,
          market: market as UiDerivativeMarketWithToken,
          slippage: slippage.toNumber(),
          leverage,
          percent: percentageToNumber.toNumber()
        })
      }

      return getDerivativesLimitBaseAmountForPercentage({
        market: market as UiDerivativeMarketWithToken,
        quoteAvailableBalance,
        leverage,
        percentageToNumber: percentageToNumber.toNumber(),
        records: orderTypeBuy ? sells : buys,
        feeRate,
        executionPrice
      })
    },

    approxAmountFromPercentage(): string {
      const {
        proportionalPercentage,
        maxDerivativesAmountFromPercentage,
        defaultDerivativesAmountFromPercentage,
        orderTypeReduceOnly,
        orderTypeBuy,
        buys,
        baseAvailableBalance,
        isSpot,
        quoteAvailableBalance,
        position,
        maxReduceOnly,
        sells,
        feeRate,
        executionPrice,
        market
      } = this

      if (!market) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      if (orderTypeReduceOnly && position) {
        return maxReduceOnly
          .times(percentageToNumber)
          .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
      }

      if (!isSpot) {
        return proportionalPercentage === 100
          ? maxDerivativesAmountFromPercentage
          : defaultDerivativesAmountFromPercentage
      }

      if (!orderTypeBuy) {
        return getSpotBaseAmountForPercentageSell({
          buys,
          baseAvailableBalance,
          market: market as UiSpotMarketWithToken,
          percentageToNumber
        })
      }

      return getSpotBaseAmountForPercentageBuy({
        market: market as UiSpotMarketWithToken,
        quoteAvailableBalance,
        percentageToNumber: percentageToNumber.toNumber(),
        sells,
        feeRate,
        executionPrice
      })
    },

    quoteAmountFromPercentage(): string {
      const {
        maxReduceOnly,
        orderTypeReduceOnly,
        proportionalPercentage,
        worstPrice,
        feeRate,
        leverage,
        market,
        position,
        quoteAvailableBalance,
        orderTypeBuy,
        sells,
        buys
      } = this

      if (!market) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      if (orderTypeReduceOnly && position) {
        return maxReduceOnly
          .times(percentageToNumber)
          .times(worstPrice)
          .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
      }

      return getDerivativesQuoteAmountForPercentageNonReduceOnly({
        percentageToNumber,
        quoteAvailableBalance,
        market: market as UiDerivativeMarketWithToken,
        records: orderTypeBuy ? sells : buys,
        leverage,
        feeRate
      }).toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
    }
  },

  methods: {
    onPercentAmountSelected(percent = 100) {
      this.$emit('update:proportionalPercentage', percent)

      this.updateBaseAndQuoteAmountFromPercentage()
    },

    /**
     * We need to first update the form amount
     * in order to get the new fees that apply to this order
     * and then we update the amount again to account the fees
     * into consideration
     */
    updateBaseAndQuoteAmountFromPercentage() {
      this.updateBaseAmountBasedOnPercentage()

      this.$nextTick(() => {
        this.updateBaseAmountBasedOnPercentage()

        this.updateQuoteAmountBasedOnPercentage()
      })
    },

    updateBaseAmountBasedOnPercentage() {
      const {
        hasPrice,
        tradingTypeMarket,
        market,
        approxAmountFromPercentage = ''
      } = this

      if (!market) {
        return
      }

      if (!hasPrice && !tradingTypeMarket) {
        this.$emit('update:priceFromLastTradedPrice')
      }

      this.$emit(
        'update:baseAmountFromPercentage',
        formatAmountToAllowableDecimals(
          approxAmountFromPercentage,
          market.quantityDecimals
        )
      )
    },

    updateQuoteAmountBasedOnPercentage() {
      const { isSpot, quoteAmountFromPercentage, market } = this

      if (!market) {
        return
      }

      isSpot
        ? this.updateSpotQuoteAmount()
        : this.$emit(
            'update:quoteAmountFromPercentage',
            quoteAmountFromPercentage
          )
    },

    updateSpotQuoteAmount() {
      const {
        quoteAvailableBalance = ZERO_IN_BASE,
        sells,
        takerFeeRate,
        market,
        orderTypeBuy,
        buys,
        baseAvailableBalance,
        executionPrice,
        feeRate,
        proportionalPercentage
      } = this

      if (!market) {
        return
      }

      const percentToNumber = new BigNumberInBase(proportionalPercentage).div(
        100
      )

      const quoteAmount = orderTypeBuy
        ? getSpotQuoteForPercentageBuy({
            sells,
            market: market as UiSpotMarketWithToken,
            quoteAvailableBalance,
            percentToNumber,
            takerFeeRate
          })
        : getSpotQuoteForPercentageSell({
            buys,
            market: market as UiSpotMarketWithToken,
            baseAvailableBalance,
            percentToNumber,
            executionPrice,
            feeRate
          })

      this.$emit('update:quoteAmountFromPercentage', quoteAmount)
    }
  }
})
</script>
