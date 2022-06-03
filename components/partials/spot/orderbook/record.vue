<template>
  <li
    v-if="market"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative cursor-pointer w-full overflow-hidden"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <span class="size-col" :class="newRecordClass"></span>
    <span
      class="depth-col"
      :style="depthWidth"
      :class="type === SpotOrderSide.Buy ? 'buys' : 'sells'"
    ></span>
    <span
      class="w-1/3 text-xs px-2 flex items-center justify-end z-10"
      @click.stop="onPriceClick"
    >
      <IconArrow
        v-if="existsInUserOrders"
        class="text-gray-300 transform rotate-180 mr-2 w-2 h-2"
      />
      <span
        class="block text-right font-mono"
        :class="{
          'text-aqua-500': recordTypeBuy,
          'text-red-500': !recordTypeBuy
        }"
      >
        <v-number
          :prefix="
            aggregatedValue.gt(record.aggregatedPrice || 0) && recordTypeBuy
              ? '<'
              : ''
          "
          :decimals="aggregation < 0 ? 0 : aggregation"
          :number="
            aggregatedValue.gt(record.aggregatedPrice || 0)
              ? aggregatedValue
              : record.aggregatedPrice
          "
          dont-group-values
          data-cy="orderbook-record-price-text-content"
        />
      </span>
    </span>
    <span class="w-1/3 text-xs px-2 z-10" @click.stop="onQuantityClick">
      <span
        class="block text-right font-mono"
        :class="{
          'text-red-500': quantityChange === Change.Decrease,
          'text-aqua-500': quantityChange === Change.Increase
        }"
      >
        <v-number
          :decimals="
            market
              ? market.quantityDecimals
              : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          "
          :number="quantity"
          dont-group-values
          data-cy="orderbook-record-quantity-text-content"
        />
      </span>
    </span>
    <span
      class="w-1/3 text-xs px-2 z-10 font-mono text-right"
      @click.stop="onTotalNotionalClick"
    >
      <v-number
        :decimals="
          market ? market.priceDecimals : UI_DEFAULT_PRICE_DISPLAY_DECIMALS
        "
        :number="total"
        dont-group-values
        data-cy="orderbook-record-total-text-content"
      />
    </span>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumberInBase,
  BigNumber,
  BigNumberInWei
} from '@injectivelabs/utils'
import {
  Change,
  UiOrderbookPriceLevel,
  ZERO_IN_BASE,
  UiSpotMarketWithToken
} from '@injectivelabs/ui-common'
import { SpotOrderSide } from '@injectivelabs/spot-consumer'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  props: {
    userOrders: {
      required: true,
      type: Array as PropType<Array<string>>
    },

    type: {
      required: true,
      type: String as PropType<SpotOrderSide>
    },

    position: {
      required: true,
      type: Number
    },

    record: {
      required: true,
      type: Object as PropType<UiOrderbookPriceLevel>
    },

    aggregation: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
      UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
      Change,
      SpotOrderSide
    }
  },

  computed: {
    market(): UiSpotMarketWithToken | undefined {
      return this.$accessor.spot.market
    },

    existsInUserOrders(): boolean {
      return this.userOrders.some((price) => {
        if (!this.record.aggregatePrices) {
          return false
        }

        return this.record.aggregatePrices.includes(price)
      })
    },

    recordTypeBuy(): boolean {
      const { type } = this

      return type === SpotOrderSide.Buy
    },

    total(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(record.total || 0)
    },

    quantity(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(record.quantity).toBase(
        market.baseToken.decimals
      )
    },

    depthWidth(): { width: string } {
      const { record } = this

      return {
        width: `${record.depth}%`
      }
    },

    newRecordClass(): string {
      const { quantityChange, type } = this

      switch (quantityChange) {
        case Change.NoChange:
          return ''
        case Change.New:
          return type === SpotOrderSide.Buy ? 'up' : 'down'
        case Change.Increase:
          return 'up'
        case Change.Decrease:
          return 'down'
        default:
          return ''
      }
    },

    quantityChange(): Change {
      const { record } = this
      const { oldQuantity, quantity } = record

      const oldQuantityBN = new BigNumber(oldQuantity || 0)
      const quantityBN = new BigNumber(quantity)

      if (oldQuantityBN.isNaN()) {
        return Change.NoChange
      }

      if (oldQuantityBN.eq(0)) {
        return Change.New
      }

      if (oldQuantityBN.eq(quantityBN)) {
        return Change.NoChange
      }

      return oldQuantityBN.gte(quantityBN) ? Change.Decrease : Change.Increase
    },

    aggregatedValue(): BigNumberInBase {
      const { aggregation } = this

      const value = new BigNumberInBase(10 ** Math.abs(aggregation))

      return aggregation < 0 ? value : new BigNumberInBase(1).dividedBy(value)
    }
  },

  methods: {
    onPriceClick() {
      const { market, record } = this

      if (!market || !record.aggregatedPrice) {
        return
      }

      this.$root.$emit('orderbook-price-click', record.aggregatedPrice)
    },

    onQuantityClick() {
      const { quantity, market } = this

      if (!market) {
        return
      }

      this.$root.$emit('orderbook-size-click', quantity.toFixed())
    },

    onTotalNotionalClick() {
      const { total, record, type, market } = this

      if (!market || !record.aggregatedPrice) {
        return
      }

      this.$root.$emit('orderbook-notional-click', {
        total,
        type,
        price: record.aggregatedPrice
      })
    },

    handleMouseEnter() {
      const { position } = this

      this.$emit('update:active-position', position)
    },

    handleMouseLeave() {
      this.$emit('update:active-position', null)
    }
  }
})
</script>
