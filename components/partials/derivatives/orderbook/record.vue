<template>
  <li
    v-if="market"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative cursor-pointer w-full overflow-hidden"
    :class="{
      'border-aqua-500': recordTypeBuy,
      'border-red-500': !recordTypeBuy
    }"
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
        {{ priceToFormat }}
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
        {{ quantityToFormat }}
      </span>
    </span>
    <span
      class="w-1/3 text-xs px-2 z-10 font-mono text-right"
      @click.stop="onTotalNotionalClick"
    >
      {{ totalToFormat }}
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
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS,
  UI_DEFAULT_PRICE_DISPLAY_DECIMALS,
  ZERO_IN_BASE
} from '~/app/utils/constants'
import {
  Change,
  DerivativeOrderSide,
  UiDerivativeMarket,
  UiOrderbookPriceLevel,
  Icon
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
    }
  },

  data() {
    return {
      Icon,
      Change,
      DerivativeOrderSide
    }
  },

  computed: {
    market(): UiDerivativeMarket | undefined {
      return this.$accessor.derivatives.market
    },

    existsInUserOrders(): boolean {
      return this.userOrders.includes(this.record.price.toString())
    },

    recordTypeBuy(): boolean {
      const { type } = this

      return type === DerivativeOrderSide.Buy
    },

    price(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(record.price).toBase(market.quoteToken.decimals)
    },

    priceToFormat(): string {
      const { market, price } = this

      if (!market) {
        return price.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return price.toFormat(market.priceDecimals)
    },

    total(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(record.total || 0)
    },

    totalToFormat(): string {
      const { market, total } = this

      if (!market) {
        return total.toFormat(UI_DEFAULT_PRICE_DISPLAY_DECIMALS)
      }

      return total.toFormat(market.priceDecimals)
    },

    quantity(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(record.quantity)
    },

    quantityToFormat(): string {
      const { market, quantity } = this

      if (!market) {
        return quantity.toFormat(UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS)
      }

      return quantity.toFormat(market.quantityDecimals)
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
      const { market, price } = this

      if (!market) {
        return
      }

      this.$root.$emit('orderbook-price-click', price.toFixed())
    },

    onQuantityClick() {
      const { quantity, market } = this

      if (!market) {
        return
      }

      this.$root.$emit('orderbook-size-click', quantity.toFixed())
    },

    onTotalNotionalClick() {
      const { total, price, type, market } = this

      if (!market) {
        return
      }

      this.$root.$emit('orderbook-notional-click', { total, type, price })
    }
  }
})
</script>
