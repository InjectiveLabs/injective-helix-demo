<template>
  <tr v-if="market">
    <td class="text-left cursor-pointer" @click="handleClickOnMarket">
      <div class="flex items-center justify-start">
        <div v-if="market.baseToken.logo" class="w-6 h-6">
          <img
            :src="market.baseToken.logo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span class="text-gray-200 font-semibold">
            {{ position.ticker }}
          </span>
        </div>
      </div>
    </td>

    <td class="text-left pl-1">
      <span
        :class="{
          'text-aqua-500': position.direction === TradeDirection.Long,
          'text-red-500': position.direction === TradeDirection.Short
        }"
      >
        {{ directionLocalized }}
      </span>
    </td>

    <td class="text-right font-mono">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <v-number
        v-else
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </td>

    <td class="text-right font-mono">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <div v-else>
        <v-number
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="price"
        />
        <span class="text-gray-500 text-xs">{{ markPriceToFormat }}</span>
      </div>
    </td>

    <td class="text-right font-mono">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <v-number
        v-else
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="liquidationPrice"
      />
    </td>
    <td class="text-right">
      <span v-if="hideBalance" class="font-mono">{{
        HIDDEN_BALANCE_DISPLAY
      }}</span>
      <div
        v-else-if="!pnl.isNaN()"
        class="flex items-center justify-end text-xs"
        :class="pnlClass"
      >
        <div class="flex items-end flex-col">
          <span class="flex items-center">
            <span class="mr-1">≈</span>
            <span>{{ pnl.gte(0) ? '+' : '' }}</span>
            <span
              :class="{
                'text-aqua-500': pnl.gte(0),
                'text-red-500': pnl.lt(0)
              }"
            >
              {{ pnlToFormat }}
            </span>
            <span class="ml-1 text-2xs">{{ market.quoteToken.symbol }}</span>
          </span>
          <span class="flex">
            {{ (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2) }}%
          </span>
        </div>
      </div>
      <span v-else class="text-gray-400">{{
        $t('trade.not_available_n_a')
      }}</span>
    </td>
    <td class="text-right font-mono">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <v-number
        v-else
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="notionalValue"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </v-number>
    </td>
    <td class="text-right">
      <span v-if="hideBalance" class="font-mono">
        {{ HIDDEN_BALANCE_DISPLAY }}
      </span>
      <div v-else class="flex items-center justify-end h-8">
        <v-number
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="margin"
        />
        <button
          role="button"
          type="button"
          class="border border-gray-500 text-gray-500 hover:text-primary-500 hover:border-primary-500 ml-2 px-1"
          @click.stop.prevent="onAddMarginButtonClick"
        >
          &plus;
        </button>
      </div>
    </td>
    <td class="text-right font-mono">
      <span v-if="hideBalance">{{ HIDDEN_BALANCE_DISPLAY }}</span>
      <span
        v-else-if="effectiveLeverage.gte(0)"
        class="flex items-center justify-end"
      >
        {{ effectiveLeverage.toFormat(2) }}
        <span class="text-gray-300">&times;</span>
      </span>
      <span v-else class="text-gray-400">
        {{ $t('trade.not_available_n_a') }}
      </span>
    </td>

    <td class="text-center relative">
      <v-button
        v-if="!hideBalance"
        :status="status"
        @click="onClosePositionClick"
      >
        <div
          class="flex items-center justify-center rounded-full bg-opacity-10 w-8 h-8 hover:bg-opacity-10 bg-red-550 hover:bg-red-600 text-red-550 hover:text-red-600"
        >
          <v-icon-close class="h-4 w-4" />
        </div>
      </v-button>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { TradeDirection } from '@injectivelabs/ts-types'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  UiPosition,
  UiSpotLimitOrder,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    position: {
      required: true,
      type: Object as PropType<UiPosition>
    },

    hideBalance: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      HIDDEN_BALANCE_DISPLAY,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      TradeDirection,
      status: new Status()
    }
  },

  computed: {
    currentMarket(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    currentOrders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    reduceOnlyCurrentOrders(): UiDerivativeLimitOrder[] {
      const { currentOrders } = this

      return currentOrders.filter((order) => order.isReduceOnly)
    },

    hasReduceOnlyOrders(): boolean {
      const { reduceOnlyCurrentOrders } = this

      return reduceOnlyCurrentOrders.length > 0
    },

    isOnMarketPage(): boolean {
      return this.$route.name === 'derivatives-derivative'
    },

    market(): UiDerivativeMarketWithToken | undefined {
      const { markets, position } = this

      return markets.find((m) => m.marketId === position.marketId)
    },

    orders(): Array<UiDerivativeLimitOrder | UiSpotLimitOrder> {
      const { isOnMarketPage, currentOrders } = this

      if (isOnMarketPage) {
        return currentOrders
      }

      return this.$accessor.derivatives.subaccountOrders
    },

    price(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.entryPrice).toBase(
        market.quoteToken.decimals
      )
    },

    margin(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.margin).toBase(
        market.quoteToken.decimals
      )
    },

    quantity(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(position.quantity)
    },

    markPrice(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(position.markPrice).toBase(
        market.quoteToken.decimals
      )
    },

    notionalValue(): BigNumberInBase {
      const { market, quantity, markPrice } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return markPrice.times(quantity)
    },

    liquidationPrice(): BigNumberInBase {
      const { position, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const liquidationPrice = new BigNumberInWei(
        position.liquidationPrice
      ).toBase(market.quoteToken.decimals)

      return liquidationPrice.gt(0) ? liquidationPrice : new BigNumberInBase(0)
    },

    totalReduceOnlyQuantity(): BigNumberInBase {
      const { market, position, orders } = this

      if (!position || !market) {
        return ZERO_IN_BASE
      }

      const reduceOnlyOrders = orders.filter(
        (o) => (o as UiDerivativeLimitOrder).isReduceOnly
      )

      return reduceOnlyOrders.reduce(
        (total, order) => total.plus(order.quantity),
        ZERO_IN_BASE
      )
    },

    bankruptcyPrice(): BigNumberInBase {
      const { market, price, margin, position, quantity } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const isPositionLong = position.direction === TradeDirection.Long
      const unitMargin = new BigNumberInBase(margin).dividedBy(quantity)

      return isPositionLong ? price.minus(unitMargin) : price.plus(unitMargin)
    },

    feeAdjustedBankruptcyPrice(): BigNumberInBase {
      const { bankruptcyPrice, position, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const minTickPrice = new BigNumberInBase(
        new BigNumberInBase(1).shiftedBy(-market.priceDecimals)
      )
      const isPositionLong = position.direction === TradeDirection.Long
      const feeAdjustedBankruptcyPrice = isPositionLong
        ? bankruptcyPrice.dividedBy(
            new BigNumberInBase(1).minus(market.takerFeeRate)
          )
        : bankruptcyPrice.dividedBy(
            new BigNumberInBase(1).plus(market.takerFeeRate)
          )

      return feeAdjustedBankruptcyPrice.gt(0)
        ? feeAdjustedBankruptcyPrice
        : minTickPrice
    },

    pnl(): BigNumberInBase {
      const { markPrice, market, position, price } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(position.quantity)
        .times(markPrice.minus(price))
        .times(position.direction === TradeDirection.Long ? 1 : -1)
    },

    pnlToFormat(): string {
      const { market, pnl } = this

      if (!market) {
        return pnl.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return pnl.toFormat(market.priceDecimals)
    },

    markPriceToFormat(): string {
      const { market, markPrice } = this

      if (!market) {
        return markPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return markPrice.toFormat(market.priceDecimals)
    },

    percentagePnl(): BigNumberInBase {
      const { pnl, market, margin } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (pnl.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(pnl.dividedBy(margin).times(100))
    },

    pnlClass(): string {
      const { pnl } = this

      if (pnl.isNaN()) {
        return ''
      }

      return pnl.gte(0) ? 'text-aqua-500' : 'text-red-500'
    },

    effectiveLeverage(): BigNumberInBase {
      const { pnl, notionalValue, margin, market } = this

      if (!market || margin.lte(0) || notionalValue.lte(0) || pnl.isNaN()) {
        return ZERO_IN_BASE
      }

      const effectiveLeverage = new BigNumberInBase(
        notionalValue.dividedBy(margin.plus(pnl))
      )

      return effectiveLeverage.gt(0)
        ? effectiveLeverage
        : new BigNumberInBase(0)
    },

    notEnoughLiquidityError(): string | undefined {
      const { pnl, market } = this

      if (!market) {
        return
      }

      if (pnl.isNaN()) {
        return this.$t('trade.no_liquidity')
      }

      return undefined
    },

    aggregateReduceOnlyQuantityExceedError(): string | undefined {
      const { totalReduceOnlyQuantity, position } = this

      if (
        totalReduceOnlyQuantity.gt(0) &&
        totalReduceOnlyQuantity.lt(position.quantity)
      ) {
        return this.$t('trade.reduce_only_exceed_position')
      }

      return undefined
    },

    positionCloseError(): string | undefined {
      const {
        notEnoughLiquidityError,
        aggregateReduceOnlyQuantityExceedError,
        market
      } = this

      if (!market) {
        return
      }

      if (notEnoughLiquidityError) {
        return notEnoughLiquidityError
      }

      if (aggregateReduceOnlyQuantityExceedError) {
        return aggregateReduceOnlyQuantityExceedError
      }

      return undefined
    },

    directionLocalized(): string {
      const { position } = this

      return position.direction === TradeDirection.Long
        ? this.$t('trade.long')
        : this.$t('trade.short')
    }
  },

  methods: {
    onAddMarginButtonClick() {
      this.$root.$emit('add-margin-to-position', this.position)
    },

    onClosePositionClick() {
      const { positionCloseError, market } = this

      if (!market) {
        return
      }

      if (positionCloseError) {
        return this.$toast.error(positionCloseError)
      }

      return this.handleClosePosition()
    },

    handleClosePosition() {
      const { hasReduceOnlyOrders } = this

      if (hasReduceOnlyOrders) {
        return this.closePositionAndReduceOnlyOrders()
      }

      return this.closePosition()
    },

    closePosition() {
      const { position, market } = this

      if (!market) {
        return
      }

      this.status.setLoading()

      this.$accessor.positions
        .closePosition({
          position,
          market
        })
        .then(() => {
          this.$toast.success(this.$t('trade.position_closed'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    closePositionAndReduceOnlyOrders() {
      const { position, market, reduceOnlyCurrentOrders } = this

      if (!market) {
        return
      }
      this.status.setLoading()

      this.$accessor.positions
        .closePositionAndReduceOnlyOrders({
          market,
          position,
          reduceOnlyOrders: reduceOnlyCurrentOrders
        })
        .then(() => {
          this.$toast.success(this.$t('trade.position_closed'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
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
