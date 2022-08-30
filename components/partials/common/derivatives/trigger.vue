<template>
  <tr
    v-if="market"
    :data-cy="'derivative-order-table-row-' + market.ticker"
    :data-cy-hash="trigger.orderHash"
  >
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
        :number="total"
      />
    </td>

    <td v-if="!isBinaryOptionsPage" class="h-12 text-right font-mono">
      <span
        v-if="leverage.gte(0)"
        class="flex items-center justify-end text-xs"
        data-cy="derivative-order-leverage-table-data"
      >
        {{ leverage.toFormat(2) }}
        <span class="text-gray-300">&times;</span>
      </span>
      <span
        v-else
        class="text-gray-400 text-xs"
        data-cy="derivative-order-no-leverage-table-data"
      >
        {{ $t('trade.not_available_n_a') }}
      </span>
    </td>

    <td class="h-12 text-right font-mono">
      <VNumber
        xs
        data-cy="derivative-order-filled-quantity-table-data"
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      >
        <span slot="addon" class="text-xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </VNumber>
    </td>

    <td class="h-12 flex items-center justify-end gap-1">
      <span class="text-gray-500 text-xs font-semibold">
        {{ $t('trade.mark_price') }}
      </span>

      <span
        v-if="(isStopLoss && isSell) || (isTakeProfit && isBuy)"
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
    </td>

    <td class="h-12 relative text-right">
      <div class="flex items-center justify-end">
        <span
          v-if="false"
          class="cursor-pointer text-primary-500 mr-6"
          data-cy="derivative-order-view-link"
          @click="handleClickOnMarket"
        >
          {{ $t('common.view') }}
        </span>

        <VButton
          v-if="orderFillable"
          :status="status"
          data-cy="derivative-order-cancel-link"
          class="rounded w-6 h-6"
          @click="onCancelOrder"
        >
          <div
            class="flex items-center justify-center rounded-full w-6 h-6 bg-red-500 bg-opacity-10 text-red-500 hover:bg-red-600 hover:text-red-600 hover:bg-opacity-10"
          >
            <IconBin />
          </div>
        </VButton>

        <span v-else class="inline-block">&mdash;</span>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import {
  UiDerivativeMarketWithToken,
  DerivativeOrderSide,
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix,
  UiDerivativeOrderHistory
} from '@injectivelabs/sdk-ui-ts'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { getMarketRoute } from '~/app/utils/market'

export default Vue.extend({
  props: {
    trigger: {
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
      const { markets, trigger } = this

      return markets.find((m) => m.marketId === trigger.marketId)
    },

    isBinaryOptionsPage(): boolean {
      return this.$route.name === 'binary-options-binaryOption'
    },

    isMarketOrder(): boolean {
      const { trigger } = this

      return trigger.executionType === 'market'
    },

    isReduceOnly(): boolean {
      const { margin, trigger } = this

      if (trigger.isReduceOnly) {
        return true
      }

      return margin.isZero()
    },

    price(): BigNumberInBase {
      const { market, trigger } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trigger.price).toBase(
        market.quoteToken.decimals
      )
    },

    triggerPrice(): BigNumberInBase {
      const { trigger, market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trigger.triggerPrice).toBase(
        market.quoteToken.decimals
      )
    },

    margin(): BigNumberInBase {
      const { market, trigger } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(trigger.margin).toBase(
        market.quoteToken.decimals
      )
    },

    quantity(): BigNumberInBase {
      const { market, trigger } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(trigger.quantity)
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
      const { trigger } = this

      return new BigNumberInBase(trigger.filledQuantity)
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
      const { trigger, unfilledQuantity, quantity } = this

      if (trigger.state === 'canceled' || trigger.state === 'filled') {
        return false
      }

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
      const { trigger } = this

      switch (trigger.orderType) {
        case DerivativeOrderSide.TakeBuy:
        case DerivativeOrderSide.StopBuy:
        case DerivativeOrderSide.Buy:
          return true
        default:
          return false
      }
    },

    isSell(): boolean {
      const { trigger } = this

      switch (trigger.orderType) {
        case DerivativeOrderSide.TakeSell:
        case DerivativeOrderSide.StopSell:
        case DerivativeOrderSide.Sell:
          return true
        default:
          return false
      }
    },

    isStopLoss(): boolean {
      const { trigger } = this

      return (
        trigger.orderType === DerivativeOrderSide.StopBuy ||
        trigger.orderType === DerivativeOrderSide.StopSell
      )
    },

    isTakeProfit(): boolean {
      const { trigger } = this

      return (
        trigger.orderType === DerivativeOrderSide.TakeBuy ||
        trigger.orderType === DerivativeOrderSide.TakeSell
      )
    },

    type(): string {
      const { trigger } = this

      const executionType =
        trigger.executionType === 'market'
          ? this.$t('trade.market')
          : this.$t('trade.limit')

      switch (trigger.orderType) {
        case 'buy':
        case 'sell':
          return executionType
        case 'take_sell':
        case 'take_buy':
          return `${this.$t('trade.takeProfit')} ${executionType}`
        case 'stop_sell':
        case 'stop_buy':
          return `${this.$t('trade.stopLoss')} ${executionType}`
        default:
          return ''
      }
    }
  },

  methods: {
    onCancelOrder(): void {
      this.status.setLoading()

      this.$accessor.derivatives
        .cancelOrder(this.trigger)
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
