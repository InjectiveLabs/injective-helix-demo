<template>
  <tr v-if="market">
    <td is="v-ui-table-td" xs class="h-8">
      <v-ui-format-order-price
        v-bind="{
          value: price,
          type: trade.tradeDirection
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: quantity.toBase(market.baseToken.decimals)
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: total.toBase(market.baseToken.decimals)
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: fee.toBase(market.quoteToken.decimals)
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge
        :primary="trade.tradeDirection === TradeDirection.Long"
        :accent="trade.tradeDirection === TradeDirection.Short"
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
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
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

      return new BigNumberInBase(
        new BigNumberInBase(trade.executionPrice).toWei(
         market.quoteToken.decimals
        )
      )
    },

    quantity(): BigNumberInWei {
      const { market, trade } = this

      if (!market || !trade.executionQuantity) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(
        new BigNumberInWei(trade.executionQuantity).toFixed(
          market.maxQuantityScaleDecimals
        )
      )
    },

    total(): BigNumberInWei {
      const { quantity, price } = this

      return quantity.times(price)
    },

    time(): string {
      const { market, trade } = this

      if (!market || !trade.executedAt) {
        return ''
      }

      return format(trade.executedAt, 'kk:mm')
    },

    fee(): BigNumberInWei {
      const { market, trade } = this

      if (!market || !trade.fee) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(trade.fee)
    },

    tradeDirection(): string {
      const { trade } = this

      return trade.tradeDirection === TradeDirection.Long
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
          return this.$t('limit') // TODO
        case TradeExecutionType.LimitMatchNewOrder:
          return this.$t('limit') // TODO
        default:
          return this.$t('limit')
      }
    }
  }
})
</script>
