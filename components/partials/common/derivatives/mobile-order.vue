<template>
  <table-row v-if="market" dense>
    <div class="pb-1 col-span-2" @click="handleClickOnMarket">
      <div class="flex items-center justify-between text-xs leading-5">
        <div class="flex items-center gap-1">
          <span
            :class="{
              'text-aqua-500': order.orderSide === DerivativeOrderSide.Buy,
              'text-red-500': order.orderSide === DerivativeOrderSide.Sell
            }"
          >
            {{ orderSideLocalized }}
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

          <span v-if="leverage.gte(0)" class="font-mono">
            {{ leverage.toFormat(2) }}x
          </span>
        </div>

        <VButton
          v-if="orderFillable"
          class="cursor-pointer"
          :status="status"
          @click.stop="onCancelOrder"
        >
          <div
            class="flex items-center justify-center rounded-full bg-opacity-10 w-5 h-5 hover:bg-opacity-10 bg-red-550 text-red-550"
          >
            <IconBin class="h-3 w-3" />
          </div>
        </VButton>
      </div>
      <div
        v-if="isReduceOnly"
        class="mt-0.5 text-gray-500 uppercase tracking-widest text-2xs"
      >
        {{ $t('trade.reduce_only') }}
      </div>
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
      {{ $t('trade.filled') }} / {{ $t('trade.amount') }}
    </span>
    <div class="flex items-center gap-1 justify-end">
      <VNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="filledQuantity"
      />
      <span>/</span>
      <VNumber
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </div>

    <span class="text-gray-500 uppercase tracking-widest text-3xs">
      {{ $t('trade.total') }}
    </span>
    <div class="text-right">
      <VNumber
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="total"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </VNumber>
    </div>
  </table-row>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import {
  UiDerivativeLimitOrder,
  UiDerivativeMarketWithToken,
  DerivativeOrderSide,
  ZERO_IN_BASE,
  getTokenLogoWithVendorPathPrefix
} from '@injectivelabs/sdk-ui-ts'
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
    order: {
      required: true,
      type: Object as PropType<UiDerivativeLimitOrder>
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
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(order.unfilledQuantity)
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

    orderSideLocalized(): string {
      const { order } = this

      return order.orderSide === DerivativeOrderSide.Buy
        ? this.$t('trade.buy')
        : this.$t('trade.sell')
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
