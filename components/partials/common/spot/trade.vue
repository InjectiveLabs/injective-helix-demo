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
          'text-aqua-500': tradeTypeBuy,
          'text-red-500': !tradeTypeBuy
        }"
      >
        {{ priceToFormat }}
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      {{ quantityToFormat }}
    </td>
    <td class="h-8 text-right font-mono">
      {{ totalToFormat }}
      <span class="text-2xs text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      {{ feeToFormat }}
      <span class="text-2xs text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </td>
    <td class="h-8 text-center">
      <v-badge :aqua="tradeTypeBuy" :red="!tradeTypeBuy" sm>
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
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import { format } from 'date-fns'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  UiSpotMarket,
  UiSpotTrade,
  TradeDirection,
  TradeExecutionType
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
    currentMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    isOnMarketPage(): boolean {
      return this.$route.name === 'spot-spot'
    },

    markets(): UiSpotMarket[] {
      const { isOnMarketPage } = this

      if (isOnMarketPage) {
        return []
      }

      return this.$accessor.spot.markets
    },

    market(): UiSpotMarket | undefined {
      const { markets, currentMarket, isOnMarketPage, trade } = this

      if (isOnMarketPage) {
        return currentMarket
      }

      return markets.find((m) => m.marketId === trade.marketId)
    },

    tradeTypeBuy(): boolean {
      const { trade } = this

      return trade.tradeDirection === TradeDirection.Buy
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

    total(): BigNumberInBase {
      const { quantity, price } = this

      return quantity.times(price)
    },

    totalToFormat(): string {
      const { market, total } = this

      if (!market) {
        return total.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return total.toFormat(market.priceDecimals)
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

    feeToFormat(): string {
      const { market, fee } = this

      if (!market) {
        return fee.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return fee.toFormat(market.priceDecimals)
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
        name: 'spot-spot',
        params: {
          marketId: market.marketId,
          spot: market.slug
        }
      })
    }
  }
})
</script>
