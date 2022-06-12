<template>
  <TableRow v-if="market" dense @click.native="handleShowTradeDetails">
    <div
      class="flex items-center justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <nuxt-link class="flex items-center gap-1" :to="marketRoute">
        <span
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
        <div v-if="baseTokenLogo" class="w-4 h-4">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <span class="text-gray-200 font-semibold">
          {{ market.ticker }}
        </span>
      </nuxt-link>

      <span>{{ tradeExecutionType }}</span>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.price') }}
    </span>
    <div class="text-right">
      <VNumber
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="price"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.amount') }}
    </span>
    <div class="text-right">
      <VNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.time') }}
    </span>
    <span class="text-right text-xs font-mono tracking-wide">
      {{ time }}
    </span>
  </TableRow>
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
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import TableRow from '~/components/elements/table-row.vue'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { MarketRoute } from '~/types'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  components: {
    TableRow
  },

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

    time(): string {
      const { market, trade } = this

      if (!market || !trade.executedAt) {
        return ''
      }

      return format(trade.executedAt, 'dd MMM HH:mm:ss')
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
    },

    marketRoute(): MarketRoute {
      const { market } = this

      if (!market) {
        return { name: 'markets' }
      }

      const marketRoute = getMarketRoute(market)

      return marketRoute || { name: 'markets' }
    },

    baseTokenLogo(): string {
      const { market } = this

      if (!market) {
        return ''
      }

      if (!market.baseToken) {
        return ''
      }

      return getTokenLogoWithVendorPathPrefix(market.baseToken.logo)
    }
  },

  methods: {
    handleShowTradeDetails() {
      const { trade } = this

      this.$emit('showTradeDetails', trade)
    }
  }
})
</script>
