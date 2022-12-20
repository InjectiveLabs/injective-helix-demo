<template>
  <tr
    v-if="market"
    class="border-b border-gray-600 last-of-type:border-b-transparent hover:bg-helixGray-600 bg-transparent px-4 py-0 overflow-hidden h-14 gap-2 transition-all"
    :data-cy="'open-position-table-row-' + position.ticker"
  >
    <td class="pl-4">
      <div class="col-span-1 flex justify-start items-center gap-2">
        <img
          class="w-6 h-6 rounded-full"
          :src="baseTokenLogo"
          :alt="market.baseToken.name"
        />

        <span
          class="text-white font-bold tracking-wide text-xs lg:text-sm uppercase"
        >
          {{ position.ticker }}
        </span>
      </div>
    </td>

    <td>
      <div class="col-span-1">
        <span
          class="text-xs lg:text-sm"
          data-cy="open-position-trade-direction-table-data"
          :class="{
            'text-green-500': position.direction === TradeDirection.Long,
            'text-red-500': position.direction === TradeDirection.Short
          }"
        >
          {{ directionLocalized }}
        </span>
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <span v-if="hideBalances" class="font-mono text-xs lg:text-sm">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>

        <VNumber
          v-else
          sm
          :decimals="
            market
              ? market.quantityDecimals
              : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          "
          :number="quantity"
          data-cy="open-position-quantity-table-data"
        />
      </div>
    </td>

    <td>
      <div class="col-span-1 flex flex-col text-right">
        <span v-if="hideBalances">{{ HIDDEN_BALANCE_DISPLAY }}</span>
        <VNumber
          v-else
          sm
          :decimals="priceDecimal"
          :number="price"
          data-cy="open-position-price-table-data"
        />
        <span
          v-if="!markPrice.isNaN() && !hideBalances"
          class="font-mono text-xs lg:text-sm text-gray-450"
        >
          {{ markPriceToFormat }}
        </span>
        <span v-else class="font-mono text-xs lg:text-sm text-gray-450">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <span v-if="isBinaryOptions" class="font-mono text-xs lg:text-sm">
          &mdash;
        </span>
        <span v-else-if="hideBalances" class="font-mono text-xs lg:text-sm">
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
        <VNumber
          v-else
          sm
          :decimals="priceDecimal"
          :number="liquidationPrice"
          data-cy="open-position-liquidation-price-table-data"
        />
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <div
          v-if="!pnl.isNaN()"
          class="flex flex-col items-end"
          :class="{
            'text-green-500': pnl.gte(0),
            'text-red-500': pnl.lt(0)
          }"
        >
          <div class="flex items-center">
            <span v-if="hideBalances" class="font-mono text-xs lg:text-sm">
              {{ HIDDEN_BALANCE_DISPLAY }}
            </span>
            <span
              v-if="!hideBalances"
              class="font-mono text-xs lg:text-sm mr-1"
            >
              ≈
            </span>
            <span v-if="!hideBalances" class="font-mono text-xs lg:text-sm">
              {{ pnl.gte(0) ? '+' : '' }}
            </span>
            <span
              v-if="!hideBalances"
              class="font-mono text-xs lg:text-sm"
              data-cy="postion-entry-pnl"
            >
              {{ pnlToFormat }}
            </span>
            <span class="ml-1 font-mono text-xs lg:text-sm">
              {{ market.quoteToken.symbol }}
            </span>
          </div>
          <span
            v-if="hideBalances"
            class="flex mt-1 font-mono text-xs lg:text-sm"
          >
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>
          <span v-else class="flex mt-1 font-mono text-xs lg:text-sm">
            {{ (percentagePnl.gte(0) ? '+' : '') + percentagePnl.toFormat(2) }}%
          </span>
        </div>

        <div v-else data-cy="open-position-no-pnl-table-data">
          <span class="font-mono text-xs lg:text-sm">
            {{ $t('trade.not_available_n_a') }}
          </span>
        </div>
      </div>
    </td>

    <td>
      <div class="col-span-1 flex gap-1 justify-end">
        <div v-if="hideBalances" class="flex items-center gap-1">
          <span class="font-mono text-xs lg:text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>

          <span class="text-xs lg:text-sm text-gray-450 uppercase">
            {{ market.quoteToken.symbol }}
          </span>
        </div>

        <VNumber
          v-else
          sm
          :decimals="priceDecimal"
          :number="notionalValue"
          data-cy="open-position-total-table-data"
        >
          <span slot="addon" class="text-xs lg:text-sm text-gray-450 uppercase">
            {{ market.quoteToken.symbol }}
          </span>
        </VNumber>
      </div>
    </td>

    <td>
      <div class="col-span-1 flex text-right justify-end gap-1 items-center">
        <div class="flex items-center justify-end">
          <span v-if="hideBalances" class="font-mono text-xs lg:text-sm">
            {{ HIDDEN_BALANCE_DISPLAY }}
          </span>

          <VNumber
            v-else
            sm
            data-cy="open-position-margin-table-data"
            :decimals="priceDecimal"
            :number="margin"
          />

          <button
            v-if="!isBinaryOptions"
            role="button"
            type="button"
            class="border border-gray-500 text-gray-500 w-5 h-5 flex justify-center items-center hover:text-primary-500 hover:border-primary-500 ml-2"
            data-cy="open-position-add-margin-button"
            @click.stop.prevent="handleAddMargin"
          >
            &plus;
          </button>
        </div>
      </div>
    </td>

    <td>
      <div class="col-span-1 text-right">
        <span
          v-if="isBinaryOptions"
          class="text-white text-xs lg:text-sm font-mono"
        >
          &mdash;
        </span>
        <span
          v-else-if="hideBalances"
          class="text-white text-xs lg:text-sm font-mono"
        >
          {{ HIDDEN_BALANCE_DISPLAY }}
        </span>
        <span
          v-else-if="effectiveLeverage.gte(0)"
          class="flex items-center justify-end text-white text-xs lg:text-sm font-mono"
          data-cy="open-position-leverage-table-data"
        >
          {{ effectiveLeverage.toFormat(2) }}
          <span class="text-gray-300 text-xs lg:text-sm font-mono">
            &times;
          </span>
        </span>
        <span
          v-else
          class="text-gray-500 text-xs lg:text-sm font-mono"
          data-cy="open-position-no-leverage-table-data"
        >
          {{ $t('trade.not_available_n_a') }}
        </span>
      </div>
    </td>

    <td class="pr-4">
      <div class="col-span-1 flex items-center justify-end gap-4">
        <VButton
          data-cy="open-position-cancel-link"
          :status="status"
          class="rounded w-6 h-6"
          @click="handleClosePosition"
        >
          <div
            class="flex items-center justify-center rounded-full bg-opacity-10 w-6 h-6 hover:bg-opacity-10 bg-red-500 hover:bg-red-600 text-red-500 hover:text-red-600"
          >
            <IconClose class="h-4 w-4" />
          </div>
        </VButton>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  getTokenLogoWithVendorPathPrefix,
  MarketType,
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  UiPosition,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection } from '@injectivelabs/ts-types'
import { Status, BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import {
  HIDDEN_BALANCE_DISPLAY,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    position: {
      type: Object as PropType<UiPosition>,
      required: true
    },

    hideBalances: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      HIDDEN_BALANCE_DISPLAY,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      TradeDirection,
      status: new Status()
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    currentOrders(): UiDerivativeLimitOrder[] {
      return this.$accessor.derivatives.subaccountOrders
    },

    market(): UiDerivativeMarketWithToken | undefined {
      const { markets, position } = this

      return markets.find((m) => m.marketId === position.marketId)
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

    markPriceToFormat(): string {
      const { market, markPrice } = this

      if (!market) {
        return markPrice.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return markPrice.toFormat(market.priceDecimals)
    },

    isBinaryOptions(): boolean {
      const { market } = this

      if (!market) {
        return false
      }

      return market.subType === MarketType.BinaryOptions
    },

    priceDecimal(): number {
      const { isBinaryOptions, market } = this

      if (isBinaryOptions) {
        return UI_DEFAULT_BINARY_OPTIONS_PRICE_DECIMALS
      }

      return market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
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

    notionalValue(): BigNumberInBase {
      const { market, quantity, markPrice, price, isBinaryOptions } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return isBinaryOptions ? price.times(quantity) : markPrice.times(quantity)
    },

    positionCloseError(): string | undefined {
      const { notEnoughLiquidityError, market } = this

      if (!market) {
        return
      }

      if (notEnoughLiquidityError) {
        return notEnoughLiquidityError
      }

      return undefined
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

    reduceOnlyCurrentOrders(): UiDerivativeLimitOrder[] {
      const { currentOrders, position } = this

      return currentOrders.filter(
        (order) => order.isReduceOnly && order.marketId === position.marketId
      )
    },

    hasReduceOnlyOrders(): boolean {
      const { reduceOnlyCurrentOrders } = this

      return reduceOnlyCurrentOrders.length > 0
    },

    directionLocalized(): string {
      const { position } = this

      return position.direction === TradeDirection.Long
        ? this.$t('trade.long')
        : this.$t('trade.short')
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
    handleAddMargin() {
      this.$root.$emit('add-margin-to-position', this.position)
    },

    handleClosePosition() {
      const { positionCloseError, market } = this

      if (!market) {
        return
      }

      if (positionCloseError) {
        return this.$toast.error(positionCloseError)
      }

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
    }
  }
})
</script>
