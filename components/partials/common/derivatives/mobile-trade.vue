<template>
  <TableRow v-if="market" dense @click.native="handleShowTradeDetails">
    <div
      class="flex items-center justify-between col-span-2 text-xs leading-5 pb-1"
    >
      <div class="flex items-center gap-1" @click.stop="handleClickOnMarket">
        <span
          :class="{
            'text-aqua-500': trade.tradeDirection === TradeDirection.Buy,
            'text-red-500': trade.tradeDirection === TradeDirection.Sell
          }"
        >
          {{ tradeDirection }}
        </span>
        <div v-if="market.baseToken.logo" class="w-4 h-4">
          <img
            :src="market.baseToken.logo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <span class="text-gray-200 font-semibold">
          {{ market.ticker }}
        </span>
      </div>

      <span>{{ tradeExecutionType }}</span>
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.price') }}
    </span>
    <div class="text-right">
      <v-number
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
      <v-number
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
  UiDerivativeMarketWithToken,
  UiDerivativeTrade,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import TableRow from '~/components/elements/table-row.vue'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableRow
  },

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
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarketWithToken | undefined {
      const { markets, trade } = this

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

    time(): string {
      const { market, trade } = this

      if (!market || !trade.executedAt) {
        return ''
      }

      return format(trade.executedAt, 'dd MMM HH:mm:ss')
    },

    tradeDirection(): string {
      const { trade } = this

      return trade.tradeDirection === TradeDirection.Buy
        ? this.$t('trade.buy')
        : this.$t('trade.sell')
    },

    tradeExecutionType(): string {
      const { trade } = this

      if (trade.isLiquidation) {
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
    handleShowTradeDetails() {
      const { trade } = this

      this.$emit('showTradeDetails', trade)
    },

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
