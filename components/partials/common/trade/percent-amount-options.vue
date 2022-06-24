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
  UiPriceLevel
} from '@injectivelabs/sdk-ui-ts'
import { formatAmountToAllowableDecimals } from '~/app/utils/formatters'
import {
  getApproxAmountForBuyOrder,
  getApproxAmountForSellOrder,
  getQuoteForPercentageSell,
  getQuoteForPercentageBuy
} from '~/app/client/utils/spot'

export default Vue.extend({
  props: {
    proportionalPercentage: {
      type: Number,
      required: true
    },

    hasPrice: {
      type: Boolean,
      required: true
    },

    market: {
      type: Object as PropType<UiSpotMarketWithToken>,
      required: true
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
      type: Object as PropType<BigNumberInBase>,
      required: true
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
    }
  },

  data() {
    return {
      percentages: [25, 50, 75, 100]
    }
  },

  computed: {
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
        feeRate
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

      if (!orderTypeBuy) {
        return getApproxAmountForSellOrder({
          buys,
          balance,
          market,
          percentageToNumber
        })
      }

      return getApproxAmountForBuyOrder({
        market,
        balance,
        percentageToNumber: percentageToNumber.toNumber(),
        sells,
        feeRate,
        executionPrice
      })
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

      this.$emit(
        'update:baseAmountFromPercentage',
        formatAmountToAllowableDecimals(
          approxAmountFromPercentage,
          market.quantityDecimals
        )
      )

      if (!hasPrice) {
        this.$emit('update:priceFromLastTradedPrice')
      }
    },

    updateQuoteAmountBasedOnPercentage() {
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
            market,
            quoteAvailableBalance,
            percentToNumber,
            takerFeeRate
          })
        : getQuoteForPercentageSell({
            buys,
            market,
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
