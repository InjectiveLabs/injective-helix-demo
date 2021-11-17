<template>
  <li
    v-if="market"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative cursor-pointer w-full overflow-hidden"
  >
    <span class="size-col" :class="newRecordClass"></span>
    <span
      class="depth-col"
      :style="depthWidth"
      :class="type === DerivativeOrderSide.Buy ? 'buys' : 'sells'"
    ></span>
    <span
      class="w-1/3 text-xs px-2 flex items-center justify-end z-10"
      @click.stop="onPriceClick"
    >
      <v-icon-arrow
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
          :decimals="aggregation < 0 ? 0 : aggregation"
          :number="record.displayPrice"
          dont-group-values
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
      />
    </span>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumber } from '@injectivelabs/utils'
import {
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  Change,
  DerivativeOrderSide,
  UiDerivativeMarket,
  UiOrderbookPriceLevel
} from '~/types'

export default Vue.extend({
  props: {
    userOrders: {
      required: true,
      type: Array as PropType<Array<string>>
    },

    type: {
      required: true,
      type: String as PropType<DerivativeOrderSide>
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
      DerivativeOrderSide
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
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

      return type === DerivativeOrderSide.Buy
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

      return new BigNumberInBase(record.quantity)
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
          return type === DerivativeOrderSide.Buy ? 'up' : 'down'
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
    }
  },

  methods: {
    onPriceClick() {
      const { market, record } = this

      if (!market || !record.displayPrice) {
        return
      }

      this.$root.$emit('orderbook-price-click', record.displayPrice)
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

      if (!market || !record.displayPrice) {
        return
      }

      this.$root.$emit('orderbook-notional-click', {
        total,
        type,
        price: record.displayPrice
      })
    }
  }
})
</script>
