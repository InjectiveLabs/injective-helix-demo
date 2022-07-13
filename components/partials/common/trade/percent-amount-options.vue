<template>
  <div class="text-xs text-gray-400 flex items-center font-mono">
    <span
      v-for="(percent, index) in percentages"
      :key="index"
      :data-cy="`trading-page-precentage-selector-${percent}-span`"
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
  getDerivativesQuoteAmountForPercentageNonReduceOnly,
  getDerivativesLimitBaseAmountForPercentage,
  getDerivativesMarketBaseAmountForPercentage
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
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    takerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    makerFeeRate: {
      type: Object as PropType<BigNumberInBase>,
      required: true
    },

    orderTypeReduceOnly: {
      type: Boolean,
      default: false
    },

    inputPostOnly: {
      type: Boolean,
      required: true
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

    approxAmountFromPercentage(): string {
      const {
        market,
        proportionalPercentage,
        orderTypeReduceOnly,
        position,
        maxReduceOnly,
        isSpot,
        derivativesBaseAmount,
        spotBaseAmount
      } = this

      if (!market) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      if (!isSpot) {
        return orderTypeReduceOnly && position
          ? maxReduceOnly
              .times(percentageToNumber)
              .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
          : derivativesBaseAmount
      }

      return spotBaseAmount
    },

    derivativesBaseAmount(): string {
      const {
        buys,
        executionPrice,
        inputPostOnly,
        isSpot,
        leverage,
        makerFeeRate,
        market,
        orderTypeBuy,
        proportionalPercentage,
        quoteAvailableBalance,
        sells,
        slippage,
        takerFeeRate,
        tradingTypeMarket
      } = this

      if (!market) {
        return ''
      }

      if (isSpot || executionPrice.lte(0) || quoteAvailableBalance.lte(0)) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      return !tradingTypeMarket
        ? getDerivativesLimitBaseAmountForPercentage({
            leverage,
            executionPrice,
            quoteAvailableBalance,
            records: orderTypeBuy ? sells : buys,
            market: market as UiDerivativeMarketWithToken,
            percentageToNumber: percentageToNumber.toNumber(),
            feeRate: inputPostOnly ? makerFeeRate : takerFeeRate
          })
        : getDerivativesMarketBaseAmountForPercentage({
            leverage,
            quoteAvailableBalance,
            market: market as UiDerivativeMarketWithToken,
            slippage: slippage.toNumber(),
            percent: percentageToNumber.toNumber(),
            records: orderTypeBuy ? sells : buys
          })
    },

    spotBaseAmount(): string {
      const {
        baseAvailableBalance,
        buys,
        executionPrice,
        inputPostOnly,
        isSpot,
        makerFeeRate,
        market,
        orderTypeBuy,
        proportionalPercentage,
        quoteAvailableBalance,
        sells,
        takerFeeRate,
        tradingTypeMarket
      } = this

      if (!isSpot || !market) {
        return ''
      }

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      return !orderTypeBuy
        ? getSpotBaseAmountForPercentageSell({
            buys,
            baseAvailableBalance,
            market: market as UiSpotMarketWithToken,
            percentageToNumber
          })
        : getSpotBaseAmountForPercentageBuy({
            market: market as UiSpotMarketWithToken,
            quoteAvailableBalance,
            percentageToNumber: percentageToNumber.toNumber(),
            sells,
            feeRate:
              !tradingTypeMarket && inputPostOnly ? makerFeeRate : takerFeeRate,
            executionPrice
          })
    },

    quoteAmountFromPercentage(): string {
      const {
        buys,
        inputPostOnly,
        leverage,
        makerFeeRate,
        market,
        maxReduceOnly,
        orderTypeBuy,
        orderTypeReduceOnly,
        position,
        proportionalPercentage,
        quoteAvailableBalance,
        sells,
        takerFeeRate,
        tradingTypeMarket,
        worstPrice
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
        feeRate:
          !tradingTypeMarket && inputPostOnly ? makerFeeRate : takerFeeRate
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
        baseAvailableBalance,
        buys,
        executionPrice,
        inputPostOnly,
        makerFeeRate,
        market,
        orderTypeBuy,
        proportionalPercentage,
        quoteAvailableBalance = ZERO_IN_BASE,
        sells,
        takerFeeRate,
        tradingTypeMarket
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
            feeRate:
              !tradingTypeMarket && inputPostOnly ? makerFeeRate : takerFeeRate
          })
        : getSpotQuoteForPercentageSell({
            buys,
            market: market as UiSpotMarketWithToken,
            baseAvailableBalance,
            percentToNumber,
            executionPrice,
            feeRate:
              !tradingTypeMarket && inputPostOnly ? makerFeeRate : takerFeeRate
          })

      this.$emit('update:quoteAmountFromPercentage', quoteAmount)
    }
  }
})
</script>
