<template>
  <li v-if="market" class="flex py-1 last:mb-0 first:mt-0 relative">
    <span class="size-col" :class="newTradeClass"></span>
    <span class="w-1/3 text-xs px-2 cursor-pointer">
      <v-ui-format-order-price
        v-bind="{
          value: price.toBase(market.quoteToken.decimals),
          type: trade.tradeDirection,
          decimals: market.maxPriceScaleDecimals
        }"
        class="block text-right"
      />
    </span>
    <span class="w-1/3 text-xs px-2">
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.maxQuantityScaleDecimals
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
import { UiSpotMarket, UiSpotMarketTrade } from '~/types'
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
import { format, toDate } from 'date-fns'

export default Vue.extend({
  props: {
    trade: {
      required: true,
      type: Object as PropType<UiSpotMarketTrade>
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    price(): BigNumberInWei {
      const { market, trade } = this

      if (!market || !trade.price) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(trade.price)
    },

    quantity(): BigNumberInBase {
      const { market, trade } = this

      if (!market || !trade.price) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(trade.quantity)
    },

    time(): string {
      const { market, trade } = this

      if (!market || !trade.price) {
        return ''
      }

      return format(toDate(new Date().getTime() / 1000), 'kk:mm') // TODO
    },

    newTradeClass(): string {
      /*
      const { change, type } = this.trade

      if (change !== Change.New) {
        return ''
      }

      return type === DerivativeOrderType.Long ? 'up' : 'down' */
      return ''
    }
  }
})
</script>
