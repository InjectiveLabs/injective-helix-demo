<template>
  <VModal
    v-if="trade && market"
    :is-open="isModalOpen"
    sm
    mobile-only
    @modal-closed="closeModal"
  >
    <div slot="header" class="flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" @click="handleBack">
        <IconArrow class="w-6 h-auto" />
        <span class="font-bold text-lg">
          {{ $t('trade.tradeHistoryDetails') }}
        </span>
      </div>
    </div>

    <div class="bg-gray-900 px-3 py-4 grid grid-cols-2 gap-4 text-sm">
      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.time') }}
        </span>
        <IconInfoTooltip
          class="ml-2"
          :tooltip="$t('trade.timestamp_tooltip')"
        />
      </div>
      <span class="text-right font-mono tracking-wide">
        {{ time }}
      </span>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.pair') }}
      </span>
      <div class="flex items-center justify-end">
        <div v-if="baseTokenLogo" class="w-4 h-4">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <span class="font-semibold uppercase ml-1">
          {{ market.ticker }}
        </span>
      </div>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.type') }}
      </span>
      <span class="font-semibold text-right">{{ tradeExecutionType }}</span>

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.side') }}
      </span>
      <span
        class="font-semibold text-right"
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

      <span class="text-gray-500 uppercase tracking-widest text-xs self-center">
        {{ $t('trade.price') }}
      </span>
      <span class="text-right">
        <VNumber
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="price"
        />
      </span>

      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.amount') }}
        </span>
        <IconInfoTooltip class="ml-2" :tooltip="$t('trade.amount_tooltip')" />
      </div>
      <span class="text-right">
        <VNumber
          :decimals="
            market
              ? market.quantityDecimals
              : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          "
          :number="quantity"
        />
      </span>

      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.fee') }}
        </span>
        <IconInfoTooltip class="ml-2" :tooltip="$t('trade.fees_tooltip')" />
      </div>
      <span class="text-right">
        <VNumber use-number-decimals :number="fee">
          <span slot="addon" class="text-2xs text-gray-500">
            {{ market.quoteToken.symbol }}
          </span>
        </VNumber>
      </span>

      <div class="flex items-center">
        <span class="text-gray-500 uppercase tracking-widest text-2xs">
          {{ $t('trade.total') }}
        </span>
        <IconInfoTooltip class="ml-2" :tooltip="$t('trade.fees_tooltip')" />
      </div>
      <span class="text-right">
        <VNumber
          data-cy="trade-history-total-table-data"
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="total"
        >
          <span slot="addon" class="text-2xs text-gray-500">
            {{ market.quoteToken.symbol }}
          </span>
        </VNumber>
      </span>
    </div>
  </VModal>
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
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { Modal } from '~/types'

export default Vue.extend({
  props: {
    trade: {
      type: Object as PropType<UiSpotTrade | UiDerivativeTrade | undefined>,
      default: undefined
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
    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.MobileTradeDetails]
    },

    derivativeMarkets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    spotMarkets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    market(): UiSpotMarketWithToken | UiDerivativeMarketWithToken | undefined {
      const { derivativeMarkets, spotMarkets, isSpot, trade } = this

      if (!trade) {
        return
      }

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

    fee(): BigNumberInBase {
      const { market, tradeWithType } = this

      if (!tradeWithType || !market || !tradeWithType.fee) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(tradeWithType.fee).toBase(
        market.quoteToken.decimals
      )
    },

    total(): BigNumberInBase {
      const { quantity, price } = this

      return quantity.times(price)
    },

    time(): string {
      const { market, trade } = this

      if (!trade || !market || !trade.executedAt) {
        return ''
      }

      return format(trade.executedAt, 'dd MMM HH:mm:ss')
    },

    tradeExecutionType(): string {
      const { trade, isSpot } = this

      if (!trade) {
        return ''
      }

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
    closeModal() {
      this.$accessor.modal.closeModal(Modal.MobileTradeDetails)
    },

    handleBack() {
      this.closeModal()
    }
  }
})
</script>
