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
          'text-aqua-500': orderTypeBuy,
          'text-red-500': !orderTypeBuy
        }"
      >
        <v-number
          :decimals="
            market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
          "
          :number="price"
        />
      </span>
    </td>
    <td class="h-8 text-right font-mono">
      <v-number
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="quantity"
      />
    </td>
    <td class="h-8 font-mono text-right">
      <v-number
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="total"
      >
        <span slot="addon" class="text-2xs text-gray-500">
          {{ market.quoteToken.symbol }}
        </span>
      </v-number>
    </td>
    <td class="h-8 text-center">
      <v-badge :aqua="orderTypeBuy" :red="!orderTypeBuy" xs>
        <div class="w-8">
          {{ orderSideLocalized }}
        </div>
      </v-badge>
    </td>
    <td class="h-8 text-right font-mono">
      <v-number
        :decimals="
          market ? market.quantityDecimals : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
        "
        :number="unfilledQuantity"
      />
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
import { UiSpotMarket, SpotOrderSide, UiSpotLimitOrder } from '~/types'

export default Vue.extend({
  props: {
    order: {
      required: true,
      type: Object as PropType<UiSpotLimitOrder>
    }
  },

  data() {
    return {
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      SpotOrderSide,
      status: new Status()
    }
  },

  computed: {
    currentMarket(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    isOnMarketPage(): boolean {
      return this.$route.name === 'spot-spot'
    },

    markets(): UiSpotMarket[] {
      const { isOnMarketPage } = this

      if (isOnMarketPage) {
        return []
      }

      return this.$accessor.spot.markets
    },

    market(): UiSpotMarket | undefined {
      const { markets, currentMarket, isOnMarketPage, order } = this

      if (isOnMarketPage) {
        return currentMarket
      }

      return markets.find((m) => m.marketId === order.marketId)
    },

    orderTypeBuy(): boolean {
      const { order } = this

      return order.orderSide === SpotOrderSide.Buy
    },

    price(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(order.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    },

    quantity(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(order.quantity).toBase(
        market.baseToken.decimals
      )
    },

    unfilledQuantity(): BigNumberInBase {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(order.unfilledQuantity).toBase(
        market.baseToken.decimals
      )
    },

    filledQuantity(): BigNumberInBase {
      const { unfilledQuantity, quantity } = this

      return quantity.minus(unfilledQuantity)
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

      return quantity.multipliedBy(price)
    },

    orderSideLocalized(): string {
      const { order } = this

      return order.orderSide === SpotOrderSide.Buy
        ? this.$t('buy')
        : this.$t('sell')
    }
  },

  methods: {
    onCancelOrder(): void {
      this.status.setLoading()

      this.$accessor.spot
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
        name: 'spot-spot',
        params: {
          marketId: market.marketId,
          spot: market.slug
        }
      })
    }
  }
})
</script>
