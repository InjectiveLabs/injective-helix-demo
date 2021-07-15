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
          value: quantity.toBase(market.baseToken.decimals),
          decimals: market.quantityDecimals
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: total.toBase(market.baseToken.decimals),
          decimals: market.priceDecimals
        }"
        class="block text-right"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: fee.toBase(market.quoteToken.decimals),
          decimals: market.priceDecimals
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge
        :primary="trade.tradeDirection === TradeDirection.Buy"
        :accent="trade.tradeDirection === TradeDirection.Sell"
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
  UiSpotMarket,
  TradeDirection,
  TradeExecutionType,
  UiSpotTrade
} from '~/types'

export default Vue.extend({
  props: {
    trade: {
      required: true,
      type: Object as PropType<UiSpotTrade>
    }
  },

  data() {
    return {
      TradeDirection,
      TradeExecutionType
    }
  },

  computed: {
    market(): UiSpotMarket | undefined {
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

    quantity(): BigNumberInWei {
      const { market, trade } = this

      if (!market || !trade.quantity) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(trade.quantity)
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

      return format(trade.executedAt, 'dd MMM kk:mm:ss')
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

      return trade.tradeDirection === TradeDirection.Buy
        ? this.$t('buy')
        : this.$t('sell')
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
