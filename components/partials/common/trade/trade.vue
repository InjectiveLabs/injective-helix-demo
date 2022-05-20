<template>
  <tr v-if="market" :data-cy="'trade-history-table-row-' + market.ticker">
    <td class="h-8 text-left font-mono">
      <span class="text-gray-400 text-xs" data-cy="trade-entry-time">
        {{ time }}
      </span>
    </td>
    <td class="h-8 text-left cursor-pointer" @click="handleClickOnMarket">
      <div class="flex items-center justify-start">
        <div v-if="market.baseToken.logo" class="w-6 h-6">
          <img
            :src="market.baseToken.logo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 font-semibold"
            data-cy="trade-history-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-8 text-left" data-cy="trade-history-execution-type-table-data">
      {{ tradeExecutionType }}
    </td>

    <td class="h-8 text-left">
      <span
        data-cy="trade-history-trade-directon-table-data"
        :class="{
          'text-aqua-500': trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{
          $t(
            `trade.${
              trade.tradeDirection === TradeDirection.Buy ? 'buy' : 'sell'
            }`
          )
        }}
      </span>
    </td>

    <td class="h-8 text-right font-mono">
      <v-number
        data-cy="trade-history-price-table-data"
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="price"
      />
    </td>

    <td class="h-8 text-right font-mono">
      <v-number
        data-cy="trade-history-quantity-table-data"
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </td>
    <td class="h-8 text-right font-mono">
      <v-number
        use-number-decimals
        :number="fee"
        data-cy="trade-history-fee-table-data"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </v-number>
    </td>

    <td class="h-8 text-right font-mono">
      <v-number
        data-cy="trade-history-total-table-data"
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
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { format } from 'date-fns'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'
import {
  UiDerivativeTrade,
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken,
  UiSpotTrade,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    trade: {
      required: true,
      type: Object as PropType<UiSpotTrade | UiDerivativeTrade>
    },

    isSpot: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      TradeDirection,
      TradeExecutionType
    }
  },

  computed: {
    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    market(): UiSpotMarketWithToken | UiDerivativeMarketWithToken | undefined {
      const { derivativeMarkets, spotMarkets, isSpot, trade } = this

      return isSpot
        ? spotMarkets.find((m) => m.marketId === trade.marketId)
        : derivativeMarkets.find((m) => m.marketId === trade.marketId)
    },

    tradeWithType(): UiSpotTrade {
      const { trade, isSpot } = this

      if (isSpot) {
        return trade as UiSpotTrade
      }

      const derivativeTrade = trade as UiDerivativeTrade

      return {
        ...derivativeTrade,
        price: derivativeTrade.executionPrice,
        quantity: derivativeTrade.executionQuantity,
        timestamp: derivativeTrade.executedAt
      } as UiSpotTrade
    },

    price(): BigNumberInBase {
      const { tradeWithType, market, isSpot } = this

      if (!market || !tradeWithType.price) {
        return ZERO_IN_BASE
      }

      if (isSpot) {
        return new BigNumberInBase(
          new BigNumberInBase(tradeWithType.price).toWei(
            market.baseToken.decimals - market.quoteToken.decimals
          )
        )
      }

      return new BigNumberInWei(tradeWithType.price).toBase(
        market.quoteToken.decimals
      )
    },

    quantity(): BigNumberInBase {
      const { market, tradeWithType, isSpot } = this

      if (!market || !tradeWithType.quantity) {
        return ZERO_IN_BASE
      }

      return isSpot
        ? new BigNumberInWei(tradeWithType.quantity).toBase(
            market.baseToken.decimals
          )
        : new BigNumberInBase(tradeWithType.quantity)
    },

    total(): BigNumberInBase {
      const { quantity, price } = this

      return quantity.times(price)
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

    tradeExecutionType(): string {
      const { trade, isSpot } = this

      const derivativeTrade = trade as UiDerivativeTrade

      if (!isSpot && derivativeTrade.isLiquidation) {
        return this.$t('trade.liquidation')
      }

      switch (trade.tradeExecutionType) {
        case TradeExecutionType.LimitFill:
          return this.$t('trade.limit')
        case TradeExecutionType.Market:
          return this.$t('trade.market')
        case TradeExecutionType.LimitMatchRestingOrder:
          return this.$t('trade.limit')
        case TradeExecutionType.LimitMatchNewOrder:
          return this.$t('trade.limit')
        default:
          return this.$t('trade.limit')
      }
    }
  },

  methods: {
    handleClickOnMarket() {
      const { market, isSpot } = this

      if (!market) {
        return
      }

      return this.$router.push({
        name: isSpot ? 'spot-spot' : 'derivatives-derivative',
        params: {
          marketId: market.marketId,
          spot: market.slug
        }
      })
    }
  }
})
</script>
