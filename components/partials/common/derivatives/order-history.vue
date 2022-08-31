<template>
  <tr
    v-if="market"
    :data-cy="'derivative-order-table-row-' + market.ticker"
    :data-cy-hash="order.orderHash"
  >
    <td class="h-12 text-left">
      <span class="text-white text-xs">
        {{ timestamp }}
      </span>
    </td>

    <td class="h-12 text-left cursor-pointer" @click="handleClickOnMarket">
      <div class="flex items-center justify-start">
        <div v-if="baseTokenLogo" class="w-4 h-4">
          <img
            :src="baseTokenLogo"
            :alt="market.baseToken.name"
            class="min-w-full h-auto rounded-full"
          />
        </div>
        <div class="ml-3">
          <span
            class="text-gray-200 text-xs"
            data-cy="derivative-order-ticker-name-table-data"
          >
            {{ market.ticker }}
          </span>
        </div>
      </div>
    </td>

    <td class="h-12 text-left">
      <span class="text-white text-xs">
        {{ type }}
      </span>
    </td>

    <td class="h-12 text-left">
      <span
        data-cy="derivative-order-order-side-table-data"
        class="text-xs"
        :class="{
          'text-green-500': isBuy,
          'text-red-500': !isBuy
        }"
      >
        {{ orderSideLocalized }}
      </span>
      <span
        v-if="isReduceOnly"
        class="ml-0.5 text-xs text-gray-500"
        data-cy="derivative-order-reduce-only-table-data"
      >
        {{ $t('trade.reduce_only') }}
      </span>
    </td>

    <td class="h-12 font-mono text-right">
      <span v-if="isMarketOrder" class="text-white text-xs">
        {{ $t('trade.market') }}
      </span>

      <VNumber
        v-else
        xs
        data-cy="derivative-order-price-table-data"
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="price"
      />
    </td>

    <td class="h-12 text-right font-mono">
      <VNumber
        xs
        data-cy="derivative-order-quantity-table-data"
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </td>

    <td class="h-12 font-right text-right">
      <VNumber
        xs
        data-cy="derivative-order-total-table-data"
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="total"
      >
        <span slot="addon" class="text-xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </VNumber>
    </td>

    <td class="h-12 flex items-center justify-end gap-1">
      <template v-if="order.isConditional">
        <span class="text-gray-500 text-xs font-semibold">
          {{ $t('trade.mark_price') }}
        </span>

        <span
          v-if="(isStopLoss && !isBuy) || (isTakeProfit && isBuy)"
          class="text-white text-xs font-semibold"
        >
          &le;
        </span>
        <span v-else class="text-white text-xs font-semibold"> &ge; </span>

        <VNumber
          xs
          data-cy="derivative-order-total-table-data"
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="triggerPrice"
        />
      </template>

      <template v-else>
        <span>&mdash;</span>
      </template>
    </td>

    <td class="h-12 relative text-right">
      <span class="text-white text-xs">
        {{ orderStatus }}
      </span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import {
  UiDerivativeOrderHistory,
  UiDerivativeMarketWithToken,
  DerivativeOrderSide,
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
import { format } from 'date-fns'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  props: {
    order: {
      required: true,
      type: Object as PropType<UiDerivativeOrderHistory>
    }
  },

  data() {
    return {
      DerivativeOrderSide,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      status: new Status()
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    market(): UiDerivativeMarketWithToken | undefined {
      const { markets, order } = this

      return markets.find((m) => m.marketId === order.marketId)
    },

    isBinaryOptionsPage(): boolean {
      return this.$route.name === 'binary-options-binaryOption'
    },

    isMarketOrder(): boolean {
      const { order } = this

      return order.executionType === 'market'
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

    triggerPrice(): BigNumberInBase {
      const { order, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(order.triggerPrice).toBase(
        market.quoteToken.decimals
      )
    },

    margin(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(order.margin).toBase(market.quoteToken.decimals)
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
      const { market, quantity, filledQuantity } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return quantity.minus(filledQuantity)
    },

    filledQuantity(): BigNumberInBase {
      const { order } = this

      return new BigNumberInBase(order.filledQuantity)
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

    orderSideLocalized(): string {
      const { isBuy } = this

      return isBuy ? this.$t('trade.buy') : this.$t('trade.sell')
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
    },

    isBuy(): boolean {
      const { order } = this

      if (order.direction === DerivativeOrderSide.Buy) {
        return true
      }

      switch (order.orderType) {
        case DerivativeOrderSide.TakeBuy:
        case DerivativeOrderSide.StopBuy:
        case DerivativeOrderSide.Buy:
        case DerivativeOrderSide.BuyPO:
          return true
        default:
          return false
      }
    },

    isStopLoss(): boolean {
      const { order } = this

      return (
        order.orderType === DerivativeOrderSide.StopBuy ||
        order.orderType === DerivativeOrderSide.StopSell
      )
    },

    isTakeProfit(): boolean {
      const { order } = this

      return (
        order.orderType === DerivativeOrderSide.TakeBuy ||
        order.orderType === DerivativeOrderSide.TakeSell
      )
    },

    timestamp(): string {
      const { order } = this

      return format(order.createdAt, 'dd MMM HH:mm:ss')
    },

    type(): string {
      const { order } = this

      const executionType =
        order.executionType === TradeExecutionType.Market
          ? this.$t('trade.market')
          : this.$t('trade.limit')

      switch (order.orderType) {
        case DerivativeOrderSide.Buy:
        case DerivativeOrderSide.Sell:
        case DerivativeOrderSide.BuyPO:
        case DerivativeOrderSide.SellPO:
          return executionType
        case DerivativeOrderSide.TakeSell:
        case DerivativeOrderSide.TakeBuy:
          return `${this.$t('trade.takeProfit')} ${executionType}`
        case DerivativeOrderSide.StopSell:
        case DerivativeOrderSide.StopBuy:
          return `${this.$t('trade.stopLoss')} ${executionType}`
        default:
          console.log('unknown orderType:', order.orderType, order)
          return ''
      }
    },

    orderStatus(): string {
      const { order } = this

      switch (order.state) {
        case 'booked':
          return this.$t('trade.open')
        case 'partial_filled':
          return this.$t('trade.partiallyFilled')
        case 'filled':
          return this.$t('trade.filled')
        case 'canceled':
          return this.$t('trade.cancelled')
        default: {
          return ''
        }
      }
    }
  },

  methods: {
    onCancelOrder(): void {
      this.status.setLoading()

      this.$accessor.derivatives
        .cancelOrder(this.order)
        .then(() => {
          this.$toast.success(this.$t('trade.order_success_canceling'))
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

      return this.$router.push({ ...getMarketRoute(market) })
    }
  }
})
</script>
