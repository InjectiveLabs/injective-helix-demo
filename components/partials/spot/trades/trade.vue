<template>
  <li v-if="market" class="flex h-6 items-center last:mb-0 first:mt-0 relative">
    <span
      class="w-1/3 text-xs px-2 cursor-pointer text-right font-mono"
      :class="{
        'text-aqua-500': trade.tradeDirection === TradeDirection.Buy,
        'text-red-500': trade.tradeDirection === TradeDirection.Sell
      }"
    >
      {{ priceToFormat }}
    </span>
    <span class="w-1/3 text-xs px-2 text-right font-mono">
      {{ quantityToFormat }}
    </span>
    <span class="w-1/3 text-xs px-2 text-gray-500 text-right font-mono">
      {{ time }}
    </span>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UiSpotMarketWithToken,
  UiSpotTrade,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    trade: {
      required: true,
      type: Object as PropType<UiSpotTrade>
    }
  },

  data() {
    return {
      TradeDirection
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    price(): BigNumberInBase {
      const { market, trade } = this

      if (!market || !trade.price) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(trade.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    },

    priceToFormat(): string {
      const { market, price } = this

      if (!market) {
        return price.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return price.toFormat(market.priceDecimals)
    },

    quantity(): BigNumberInBase {
      const { market, trade } = this

      if (!market || !trade.quantity) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trade.quantity).toBase(
        market.baseToken.decimals
      )
    },

    quantityToFormat(): string {
      const { market, quantity } = this

      if (!market) {
        return quantity.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return quantity.toFormat(market.quantityDecimals)
    },

    time(): string {
      const { market, trade } = this

      if (!market || !trade.executedAt) {
        return ''
      }

      return format(trade.executedAt, 'HH:mm:ss')
    }
  }
})
</script>
