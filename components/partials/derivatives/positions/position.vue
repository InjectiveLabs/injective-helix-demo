<template>
  <tr v-if="market">
    <td is="v-ui-table-td" xs class="relative" center>
      <v-ui-button :status="status" xs @click="onClosePositionClick">
        <v-ui-icon
          :icon="Icon.CloseCircle"
          :tooltip="$t('close_position')"
          sm
          accent
          pointer
        ></v-ui-icon>
      </v-ui-button>
    </td>
    <td is="v-ui-table-td" xs center>
      <v-ui-badge
        :primary="position.direction === TradeDirection.Long"
        :accent="position.direction === TradeDirection.Short"
        sm
      >
        <div class="w-10">
          {{ directionLocalized }}
        </div>
      </v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.quantityDecimals
        }"
        class="block"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-price
        v-bind="{
          value: price.toBase(market.quoteToken.decimals),
          decimals: market.priceDecimals
        }"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-price
        v-bind="{
          value: liquidationPrice.toBase(market.quoteToken.decimals),
          decimals: market.priceDecimals
        }"
      />
    </td>
    <td is="v-ui-table-td" center>
      <div
        v-if="!pnl.isNaN()"
        class="flex items-center justify-center text-2xs"
        :class="pnlClass"
      >
        <span class="mr-1">≈</span>
        <div class="flex items-center">
          <span class="mr-1 flex items-center">
            <v-ui-format-price
              v-bind="{
                value: notionalPnl.toBase(market.quoteToken.decimals),
                class: pnlClass,
                decimals: market.priceDecimals
              }"
              class="text-right block"
            /><span class="ml-1">{{ market.quoteToken.symbol }}</span></span
          >
          <span class="flex" style="margin-top: -2px"
            >(<v-ui-format-percent
              v-bind="{
                appendPlusSign: true,
                precision: 2,
                value: pnl.toString()
              }"
            />)</span
          >
        </div>
      </div>
      <v-ui-text v-else muted>{{ $t('not_available_n_a') }}</v-ui-text>
    </td>
    <td is="v-ui-table-td" xs right>
      <v-ui-format-price
        v-bind="{
          value: notionalValue.toBase(market.quoteToken.decimals),
          decimals: market.priceDecimals
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs right>
      <div class="flex items-center">
        <v-ui-text>
          <v-ui-format-price
            v-bind="{
              value: margin.toBase(market.quoteToken.decimals),
              decimals: market.priceDecimals
            }"
          />
        </v-ui-text>
        <button
          role="button"
          type="button"
          class="
            border border-primary-500
            text-primary-500
            hover:text-primary-300
            ml-2
            px-1
          "
          @click.stop.prevent="onAddMarginButtonClick"
        >
          &plus;
        </button>
      </div>
    </td>
    <td is="v-ui-table-td" xs right>
      <span v-if="effectiveLeverage.gt(0)" class="whitespace-pre">
        <v-ui-format-amount
          emp
          v-bind="{
            value: effectiveLeverage,
            decimals: 2
          }"
          class="inline-block -mr-1"
        />
        <v-ui-text muted>&times;</v-ui-text>
      </span>
      <v-ui-text v-else muted>{{ $t('not_available_n_a') }}</v-ui-text>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Status, BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  UiPosition,
  TradeDirection,
  DerivativeOrderSide,
  UiDerivativeOrderbook,
  UiPriceLevel,
  Icon
} from '~/types'
import { calculateWorstExecutionPriceFromOrderbook } from '~/app/services/derivatives'

export default Vue.extend({
  props: {
    position: {
      required: true,
      type: Object as PropType<UiPosition>
    }
  },

  data() {
    return {
      Icon,
      TradeDirection,
      status: new Status()
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    price(): BigNumberInWei {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(position.entryPrice)
    },

    margin(): BigNumberInWei {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(position.margin)
    },

    orderbook(): UiDerivativeOrderbook | undefined {
      return this.$accessor.derivatives.orderbook
    },

    buys(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.buys
    },

    sells(): UiPriceLevel[] {
      const { orderbook } = this

      if (!orderbook) {
        return []
      }

      return orderbook.sells
    },

    quantity(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(position.quantity)
    },

    markPrice(): BigNumberInWei {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(position.markPrice)
    },

    notionalValue(): BigNumberInWei {
      const { market, quantity, markPrice } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return markPrice.times(quantity)
    },

    pnl(): BigNumberInBase {
      const { market, sells, position, buys } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const [sell] = sells
      const [buy] = buys
      const highestBuy = new BigNumberInBase(buy ? buy.price : 0)
      const lowestSell = new BigNumberInBase(sell ? sell.price : 0)
      const executionPrice = new BigNumberInBase(
        highestBuy.plus(lowestSell).div(2)
      )

      return new BigNumberInBase(position.quantity)
        .times(
          new BigNumberInWei(executionPrice.minus(position.entryPrice)).toBase(
            market.quoteToken.decimals
          )
        )
        .times(position.direction === TradeDirection.Long ? 1 : -1)
    },

    notionalPnl(): BigNumberInWei {
      const { pnl, market, margin } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(pnl.dividedBy(100).times(margin))
    },

    pnlClass(): string {
      const { pnl } = this

      return pnl.gte(0) ? 'text-primary-500' : 'text-accent-500'
    },

    effectiveLeverage(): BigNumberInBase {
      const { notionalPnl, notionalValue, margin, market, pnl } = this

      if (!market || margin.lte(0) || notionalValue.lte(0) || pnl.isNaN()) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        notionalValue.dividedBy(margin.plus(notionalPnl))
      )
    },

    liquidationPrice(): BigNumberInWei {
      const { position, market } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(position.liquidationPrice)
    },

    executionPrice(): BigNumberInBase {
      const { sells, buys, market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      const records = position.direction === TradeDirection.Long ? buys : sells

      return calculateWorstExecutionPriceFromOrderbook({
        records,
        market,
        amount: new BigNumberInBase(position.quantity)
      })
    },

    bankruptcyPrice(): BigNumberInBase {
      const { market, position } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(position.entryPrice).plus(
        new BigNumberInBase(position.margin)
          .dividedBy(position.quantity)
          .times(position.direction === TradeDirection.Long ? 1 : -1)
      )
    },

    notEnoughtLiqudityError(): string | undefined {
      const { pnl, market } = this

      if (!market) {
        return
      }

      if (!pnl.isNaN()) {
        return
      }

      return this.$t('no_liquidity')
    },

    autoLiquidationOnCloseError(): string | undefined {
      const { liquidationPrice, executionPrice, market, position } = this

      if (!market) {
        return
      }

      const isPositionLong = position.direction === TradeDirection.Long

      if (isPositionLong && executionPrice.lte(liquidationPrice)) {
        return this.$t('close_auto_liquidation')
      }

      if (!isPositionLong && executionPrice.gte(liquidationPrice)) {
        return this.$t('close_auto_liquidation')
      }

      return undefined
    },

    executionPriceSurpassesBankruptcyPrice(): string | undefined {
      const { executionPrice, market, position, bankruptcyPrice } = this

      if (!market) {
        return
      }

      const isPositionLong = position.direction === TradeDirection.Long
      const divisor = isPositionLong
        ? new BigNumberInBase(1).minus(market.takerFeeRate)
        : new BigNumberInBase(1).plus(market.takerFeeRate)
      const condition = bankruptcyPrice.dividedBy(divisor)

      if (isPositionLong && executionPrice.lt(condition)) {
        return this.$t('execution_price_surpasses_bankruptcy_price')
      }

      if (!isPositionLong && executionPrice.gt(condition)) {
        return this.$t('execution_price_surpasses_bankruptcy_price')
      }

      return undefined
    },

    positionCloseError(): string | undefined {
      const {
        executionPriceSurpassesBankruptcyPrice,
        notEnoughtLiqudityError,
        autoLiquidationOnCloseError,
        market
      } = this

      if (!market) {
        return
      }

      if (notEnoughtLiqudityError) {
        return notEnoughtLiqudityError
      }

      if (autoLiquidationOnCloseError) {
        return autoLiquidationOnCloseError
      }

      if (executionPriceSurpassesBankruptcyPrice) {
        return executionPriceSurpassesBankruptcyPrice
      }

      return undefined
    },

    directionLocalized(): string {
      const { position } = this

      return position.direction === TradeDirection.Long
        ? this.$t('long')
        : this.$t('short')
    }
  },

  methods: {
    onAddMarginButtonClick() {
      this.$root.$emit('add-margin-to-position', this.position)
    },

    onClosePositionClick() {
      const { position, positionCloseError, executionPrice, market } = this

      if (!market) {
        return
      }

      if (positionCloseError) {
        return this.$toast.error(positionCloseError)
      }

      this.status.setLoading()

      this.$accessor.derivatives
        .closePosition({
          orderType:
            position.direction === TradeDirection.Long
              ? DerivativeOrderSide.Sell
              : DerivativeOrderSide.Buy,
          price: executionPrice,
          quantity: new BigNumberInBase(position.quantity)
        })
        .then(() => {
          this.$toast.success(this.$t('position_closed'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
