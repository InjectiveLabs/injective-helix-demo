<template>
  <li v-if="market" class="flex h-6 items-center last:mb-0 first:mt-0 relative">
    <span class="size-col" :class="newTradeClass"></span>
    <span class="w-1/3 text-xs px-2 cursor-pointer">
      <v-ui-format-order-price
        v-bind="{
          value: price,
          decimals: market.priceDecimals,
          type: trade.tradeDirection
        }"
        class="block text-right"
      />
    </span>
    <span class="w-1/3 text-xs px-2">
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.quantityDecimals
        }"
        class="block text-right"
      />
    </span>
    <span class="w-1/3 text-xs px-2">
      <v-ui-text muted class="font-mono block text-right">
        {{ time }}
      </v-ui-text>
    </span>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { UiDerivativeMarket, UiDerivativeTrade } from '~/types'
import { ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  props: {
    trade: {
      required: true,
      type: Object as PropType<UiDerivativeTrade>
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    price(): BigNumberInBase {
      const { market, trade } = this

      if (!market || !trade.executionPrice) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trade.executionPrice).toBase(
        market.quoteToken.decimals
      )
    },

    quantity(): BigNumberInBase {
      const { market, trade } = this

      if (!market || !trade.executionQuantity) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(trade.executionQuantity)
    },

    total(): BigNumberInBase {
      const { quantity, price } = this

      return price.times(quantity)
    },

    time(): string {
      const { market, trade } = this

      if (!market || !trade.executedAt) {
        return ''
      }

      return format(trade.executedAt, 'HH:mm:ss')
    },

    newTradeClass(): string {
      /*
      const { change, type } = this.trade

      if (change !== Change.New) {
        return ''
      }

      return type === DerivativeOrderSide.Buy ? 'up' : 'down' */
      return ''
    }
  }
})
</script>
