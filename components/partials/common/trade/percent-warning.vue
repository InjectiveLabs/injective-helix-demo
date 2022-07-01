<template>
  <div
    v-if="shouldShowPercentWarning"
    class="flex mt-4 gap-2 text-xs font-semibold text-warning"
    font-semibold
    text-2xs
  >
    <span>{{ $t('trade.limited_orderbook_liquidity') }}</span>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  UiPriceLevel,
  UiSpotMarketWithToken,
  UiPerpetualMarketWithToken,
  UiExpiryFuturesMarketWithToken,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'

export default Vue.extend({
  props: {
    orderTypeBuy: {
      type: Boolean,
      required: true
    },

    baseAvailableBalance: {
      type: Object as PropType<BigNumberInBase> | undefined,
      default: undefined
    },

    quoteAvailableBalance: {
      type: Object as PropType<BigNumberInBase>,
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

    market: {
      type: Object as PropType<
        | UiSpotMarketWithToken
        | UiPerpetualMarketWithToken
        | UiExpiryFuturesMarketWithToken
      >,
      required: true
    },

    inputProportionalPercentage: {
      type: Number,
      required: true
    }
  },

  computed: {
    orderbookSellSideTotalNotional(): BigNumberInBase {
      const { sells, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return sells.reduce((totalNotional, { quantity, price }) => {
        const orderPrice = new BigNumberInBase(price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
        const orderQuantity = new BigNumberInWei(quantity).toBase(
          market.baseToken.decimals
        )

        return totalNotional.plus(orderQuantity.times(orderPrice))
      }, ZERO_IN_BASE)
    },

    percentQuoteAvailableBalanceGreaterThanOrderbookBuySideNotional(): boolean {
      const {
        orderbookSellSideTotalNotional,
        quoteAvailableBalance,
        inputProportionalPercentage
      } = this

      const percentageToNumber = new BigNumberInBase(
        inputProportionalPercentage
      ).div(100)
      const percentQuoteAvailableBalance =
        quoteAvailableBalance.times(percentageToNumber)

      return percentQuoteAvailableBalance.gt(orderbookSellSideTotalNotional)
    },

    orderbookBuySideTotalAmount(): BigNumberInBase {
      const { buys, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return buys.reduce((totalAmount, { quantity }) => {
        return totalAmount.plus(
          new BigNumberInWei(quantity).toBase(market.baseToken.decimals)
        )
      }, ZERO_IN_BASE)
    },

    percentBaseAvailableBalanceGreaterThanOrderbookSellSideAmount(): boolean {
      const {
        orderbookBuySideTotalAmount,
        baseAvailableBalance,
        inputProportionalPercentage
      } = this

      const percentageToNumber = new BigNumberInBase(
        inputProportionalPercentage
      ).div(100)
      const percentBaseAvailableBalance =
        baseAvailableBalance.times(percentageToNumber)

      return percentBaseAvailableBalance.gt(orderbookBuySideTotalAmount)
    },

    shouldShowPercentWarning(): boolean {
      const {
        orderTypeBuy,
        percentQuoteAvailableBalanceGreaterThanOrderbookBuySideNotional,
        percentBaseAvailableBalanceGreaterThanOrderbookSellSideAmount
      } = this

      return orderTypeBuy
        ? percentQuoteAvailableBalanceGreaterThanOrderbookBuySideNotional
        : percentBaseAvailableBalanceGreaterThanOrderbookSellSideAmount
    }
  }
})
</script>
