<template>
  <tr v-if="market">
    <td
      v-if="!isOnMarketPage"
      class="h-8 text-left cursor-pointer"
      @click="handleClickOnMarket"
    >
      {{ market.ticker }}
    </td>
    <td class="h-8 text-right font-mono">
      <span
        :class="{
          'text-aqua-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        <v-number
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="price"
        />
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      <v-number
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </td>
    <td class="h-8 text-right font-mono">
      <v-number
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="total"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </v-number>
    </td>
    <td class="h-8 text-right font-mono">
      <v-number use-number-decimals :number="fee">
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </v-number>
    </td>
    <td class="h-8 text-center">
      <v-badge
        :aqua="trade.tradeDirection === TradeDirection.Buy"
        :red="trade.tradeDirection === TradeDirection.Sell"
        sm
      >
        {{ tradeDirection }}
      </v-badge>
    </td>
    <td class="h-8 text-center">
      <v-badge gray sm>
        {{ tradeExecutionType }}
      </v-badge>
    </td>
    <td class="h-8 text-right font-mono">
      <span class="text-gray-400 text-xs">{{ time }}</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
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
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      TradeDirection,
      TradeExecutionType
    }
  },

  computed: {
    currentMarket(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    isOnMarketPage(): boolean {
      return this.$route.name === 'derivatives-derivative'
    },

    markets(): UiDerivativeMarket[] {
      const { isOnMarketPage } = this

      if (isOnMarketPage) {
        return []
      }

      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarket | undefined {
      const { markets, currentMarket, isOnMarketPage, trade } = this

      if (isOnMarketPage) {
        return currentMarket
      }

      return markets.find((m) => m.marketId === trade.marketId)
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
  },

  methods: {
    handleClickOnMarket() {
      const { market } = this

      if (!market) {
        return
      }

      return this.$router.push({
        name: 'derivatives-derivative',
        params: {
          marketId: market.marketId,
          derivative: market.slug
        }
      })
    }
  }
})
</script>
