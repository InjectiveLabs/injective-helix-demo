<template>
  <tr v-if="market">
    <td is="v-ui-table-td" xs class="h-8">
      <v-ui-format-order-price
        v-bind="{
          value: price,
          type: order.orderSide,
          decimals: market.priceDecimals
        }"
        class="flex justify-end"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.quantityDecimals
        }"
        class="block"
      />
    </td>
    <td is="v-ui-table-td" xs right class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: unfilledQuantity,
          decimals: market.quantityDecimals
        }"
        class="block"
      />
    </td>
    <td is="v-ui-table-td" xs class="h-8">
      <v-ui-format-amount
        v-bind="{
          value: total,
          decimals: market.priceDecimals
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs class="h-8" right>
      <v-ui-format-amount
        v-if="!leverage.isNaN()"
        v-bind="{
          value: leverage,
          decimals: 2
        }"
        class="block text-white"
      />
      <v-ui-text v-else muted>&mdash;</v-ui-text>
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge
        :aqua="order.orderSide === DerivativeOrderSide.Buy"
        :red="order.orderSide === DerivativeOrderSide.Sell"
        xs
      >
        <div class="w-8">
          {{ orderSideLocalized }}
        </div>
      </v-ui-badge>
      <v-ui-badge v-if="isReduceOnly" dark xs class="ml-2">{{
        $t('reduce_only')
      }}</v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge v-if="orderFullyFilled" aqua xs>
        {{ $t('filled') }}
      </v-ui-badge>
      <v-ui-badge v-else-if="orderFillable" dark xs>
        {{ `${filledQuantityPercentage.times(100).toFixed(2)}%` }}
      </v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs class="h-8 relative" center>
      <v-ui-button
        v-if="orderFillable"
        :status="status"
        xs
        @click="onCancelOrder"
      >
        <v-ui-icon
          :icon="Icon.Trash"
          :tooltip="$t('cancel_order')"
          sm
          red
          pointer
        ></v-ui-icon>
      </v-ui-button>
      <v-ui-text v-else-if="orderFullyFilled" emp>
        <a href target="_blank">
          <v-ui-icon :icon="Icon.ExternalLink" xs></v-ui-icon>
        </a>
      </v-ui-text>
      <span v-else class="inline-block">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '~/app/utils/constants'
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
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
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
    }
  }
})
</script>
