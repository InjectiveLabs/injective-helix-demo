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
  getApproxAmountForBuyOrder,
  getApproxAmountForSellOrder,
  getQuoteForPercentageSell,
  getQuoteForPercentageBuy
} from '~/app/client/utils/spot'
import {
  getApproxAmountFromPercentage,
  getQuoteFromPercentageQuantityNonReduceOnly
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
        buys,
        sells,
        orderTypeBuy,
        baseAvailableBalance,
        quoteAvailableBalance,
        executionPrice,
        proportionalPercentage,
        feeRate,
        orderTypeReduceOnly,
        position,
        maxReduceOnly,
        leverage,
        isSpot
      } = this

      const percentageToNumber = new BigNumberInBase(
        proportionalPercentage
      ).div(100)

      const balance = orderTypeBuy
        ? quoteAvailableBalance
        : baseAvailableBalance

      if (!market) {
        return ''
      }

      if (orderTypeReduceOnly && position) {
        return maxReduceOnly
          .times(percentageToNumber)
          .toFixed(market.quantityDecimals, BigNumberInBase.ROUND_DOWN)
      }

      if (!isSpot) {
        return getApproxAmountFromPercentage({
          market: market as UiDerivativeMarketWithToken,
          notionalWithLeverage: quoteAvailableBalance,
          leverage,
          percentageToNumber: percentageToNumber.toNumber(),
          records: orderTypeBuy ? sells : buys,
          feeRate,
          executionPrice
        })
      }

      if (!orderTypeBuy) {
        return getApproxAmountForSellOrder({
          buys,
          balance,
          market: market as UiSpotMarketWithToken,
          percentageToNumber
        })
      }

      return getApproxAmountForBuyOrder({
        market: market as UiSpotMarketWithToken,
        balance,
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
        executionPrice,
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
          .times(executionPrice)
          .toFixed(market.priceDecimals, BigNumberInBase.ROUND_DOWN)
      }

      return getQuoteFromPercentageQuantityNonReduceOnly({
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
      const { hasPrice, market, approxAmountFromPercentage = '' } = this

      if (!market) {
        return
      }

      if (!hasPrice) {
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
            'update-quote-amount-from-percentage',
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
        ? getQuoteForPercentageBuy({
            sells,
            market: market as UiSpotMarketWithToken,
            quoteAvailableBalance,
            percentToNumber,
            takerFeeRate
          })
        : getQuoteForPercentageSell({
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
