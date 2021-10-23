<template>
  <tr v-if="market">
    <td
      v-if="!isOnMarketPage"
      class="h-8 text-left cursor-pointer"
      @click="handleClickOnMarket"
    >
      {{ market.ticker }}
    </td>
    <td class="h-8 font-mono text-right">
      <span
        :class="{
          'text-aqua-500': order.orderSide === DerivativeOrderSide.Buy,
          'text-red-500': order.orderSide === DerivativeOrderSide.Sell
        }"
      >
        {{ priceToFormat }}
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      {{ quantityToFormat }}
    </td>
    <td class="h-8 font-mono text-right">
      {{ totalToFormat }}
      <span class="text-2xs text-gray-500">
        {{ market.quoteToken.symbol }}
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      <span v-if="leverage.isNaN()">&mdash;</span>
      <span v-else>{{ leverage.toFormat(2) }}</span>
    </td>
    <td class="h-8 text-center">
      <v-badge
        :aqua="order.orderSide === DerivativeOrderSide.Buy"
        :red="order.orderSide === DerivativeOrderSide.Sell"
        xs
      >
        <div class="w-8">
          {{ orderSideLocalized }}
        </div>
      </v-badge>
      <v-badge v-if="isReduceOnly" dark xs class="ml-2">
        {{ $t('reduce_only') }}
      </v-badge>
    </td>
    <td class="h-8 text-right font-mono">
      {{ unfilledQuantityToFormat }}
    </td>
    <td class="h-8 text-center">
      <v-badge v-if="orderFullyFilled" primary xs>
        {{ $t('filled') }}
      </v-badge>
      <v-badge v-else-if="orderFillable" gray xs>
        <div class="w-12 font-mono">
          {{ `${filledQuantityPercentage.times(100).toFixed(2)}%` }}
        </div>
      </v-badge>
    </td>
    <td class="h-8 relative text-center">
      <v-button
        v-if="orderFillable"
        :status="status"
        text-xs
        red
        @click="onCancelOrder"
      >
        {{ $t('cancel') }}
      </v-button>
      <span v-else class="inline-block">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  DerivativeOrderSide,
  UiDerivativeLimitOrder,
  Icon
} from '~/types'

export default Vue.extend({
  props: {
    order: {
      required: true,
      type: Object as PropType<UiDerivativeLimitOrder>
    }
  },

  data() {
    return {
      Icon,
      DerivativeOrderSide,
      status: new Status()
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
      const { markets, currentMarket, isOnMarketPage, order } = this

      if (isOnMarketPage) {
        return currentMarket
      }

      return markets.find((m) => m.marketId === order.marketId)
    },

    isReduceOnly(): boolean {
      const { margin, order } = this

      if (order.isReduceOnly) {
        return true
      }

      return margin.isZero()
    },

    price(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(order.price).toBase(market.quoteToken.decimals)
    },

    priceToFormat(): string {
      const { market, price } = this

      if (!market) {
        return price.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return price.toFormat(market.priceDecimals)
    },

    margin(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(order.margin).toBase(market.quoteToken.decimals)
    },

    marginToFormat(): string {
      const { market, margin } = this

      if (!market) {
        return margin.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return margin.toFormat(market.priceDecimals)
    },

    quantity(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(order.quantity)
    },

    quantityToFormat(): string {
      const { market, quantity } = this

      if (!market) {
        return quantity.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return quantity.toFormat(market.quantityDecimals)
    },

    unfilledQuantity(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(order.unfilledQuantity)
    },

    unfilledQuantityToFormat(): string {
      const { market, unfilledQuantity } = this

      if (!market) {
        return unfilledQuantity.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return unfilledQuantity.toFormat(market.quantityDecimals)
    },

    filledQuantity(): BigNumberInBase {
      const { unfilledQuantity, quantity } = this

      return quantity.minus(unfilledQuantity)
    },

    leverage(): BigNumberInBase {
      const { quantity, isReduceOnly, margin, price } = this

      if (isReduceOnly) {
        return new BigNumberInBase('')
      }

      return new BigNumberInBase(price.times(quantity).dividedBy(margin))
    },

    filledQuantityPercentage(): BigNumberInBase {
      const { filledQuantity, quantity, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      if (filledQuantity.lte(0)) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(filledQuantity.dividedBy(quantity))
    },

    orderFullyFilled(): boolean {
      const { unfilledQuantity } = this

      return unfilledQuantity.isZero()
    },

    orderFillable(): boolean {
      const { unfilledQuantity, quantity } = this

      return unfilledQuantity.lte(quantity)
    },

    total(): BigNumberInBase {
      const { price, quantity } = this

      return price.multipliedBy(quantity)
    },

    totalToFormat(): string {
      const { market, total } = this

      if (!market) {
        return total.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return total.toFormat(market.priceDecimals)
    },

    orderSideLocalized(): string {
      const { order } = this

      return order.orderSide === DerivativeOrderSide.Buy
        ? this.$t('long')
        : this.$t('short')
    }
  },

  methods: {
    onCancelOrder(): void {
      this.status.setLoading()

      this.$accessor.derivatives
        .cancelOrder(this.order)
        .then(() => {
          this.$toast.success(this.$t('order_success_canceling'))
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
