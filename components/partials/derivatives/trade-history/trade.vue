<template>
  <tr v-if="market">
    <td is="v-ui-table-td" xs class="h-8">
      <v-ui-format-order-price
        v-bind="{
          value: price,
          type: trade.tradeDirection,
          decimals: market.priceDecimals
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.quantityDecimals
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: total,
          decimals: market.priceDecimals
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: fee
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge
        :aqua="trade.tradeDirection === TradeDirection.Buy"
        :red="trade.tradeDirection === TradeDirection.Sell"
        sm
      >
        {{ tradeDirection }}
      </v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge dark sm>
        {{ tradeExecutionType }}
      </v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-text muted class="font-mono block text-right">
        {{ time }}
      </v-ui-text>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  TradeDirection,
  TradeExecutionType,
  UiDerivativeTrade
} from '~/types'

export default Vue.extend({
  props: {
    trade: {
      required: true,
      type: Object as PropType<UiDerivativeTrade>
    }
  },

  data() {
    return {
      TradeDirection,
      TradeExecutionType
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

      return format(trade.executedAt, 'dd MMM HH:mm:ss')
    },

    fee(): BigNumberInBase {
      const { market, trade } = this

      if (!market || !trade.fee) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trade.fee).toBase(market.quoteToken.decimals)
    },

    tradeDirection(): string {
      const { trade } = this

      return trade.tradeDirection === TradeDirection.Buy
        ? this.$t('long')
        : this.$t('short')
    },

    tradeExecutionType(): string {
      const { trade } = this

      switch (trade.tradeExecutionType) {
        case TradeExecutionType.LimitFill:
          return this.$t('limit')
        case TradeExecutionType.Market:
          return this.$t('market')
        case TradeExecutionType.LimitMatchRestingOrder:
          return this.$t('limit')
        case TradeExecutionType.LimitMatchNewOrder:
          return this.$t('limit')
        default:
          return this.$t('limit')
      }
    }
  }
})
</script>
