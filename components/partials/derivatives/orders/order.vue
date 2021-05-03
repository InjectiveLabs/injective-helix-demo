<template>
  <tr v-if="market">
    <td is="v-ui-table-td" xs class="h-8">
      <v-ui-format-order-price
        v-bind="{
          value: price.toBase(market.quoteToken.decimals),
          type: order.orderType,
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
          value: total.toBase(market.quoteToken.decimals),
          decimals: market.priceDecimals
        }"
        class="text-right block text-white"
      />
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge
        :primary="order.orderType === DerivativeOrderType.Buy"
        :accent="order.orderType === DerivativeOrderType.Sell"
        sm
      >
        <div class="w-10">
          {{ orderTypeLocalized }}
        </div>
      </v-ui-badge>
    </td>
    <td is="v-ui-table-td" xs center class="h-8">
      <v-ui-badge v-if="orderFullyFilled" primary xs>
        {{ $t('filled') }}
      </v-ui-badge>
      <v-ui-badge v-else-if="orderFillable" dark xs>
        <div class="w-16">
          {{ `${filledQuantityPercentage.times(100).toFixed(2)}%` }}
        </div>
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
          :icon="$enums.Icon.Trash"
          :tooltip="$t('cancel_order')"
          sm
          accent
          pointer
        ></v-ui-icon>
      </v-ui-button>
      <v-ui-text v-else-if="orderFullyFilled" emp>
        <a href target="_blank">
          <v-ui-icon :icon="$enums.Icon.ExternalLink" xs></v-ui-icon>
        </a>
      </v-ui-text>
      <span v-else class="inline-block">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei, Status } from '@injectivelabs/utils'
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
import {
  UiDerivativeMarket,
  DerivativeOrderType,
  UiDerivativeLimitOrder
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
      DerivativeOrderType,
      status: new Status()
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    price(): BigNumberInWei {
      const { market, order } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(order.price)
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

    total(): BigNumberInWei {
      const { price, quantity } = this

      return price.multipliedBy(quantity)
    },

    orderTypeLocalized(): string {
      const { order } = this

      return order.orderType === DerivativeOrderType.Buy
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
