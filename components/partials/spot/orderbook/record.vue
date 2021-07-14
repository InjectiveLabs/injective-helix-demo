<template>
  <li
    v-if="market"
    class="flex h-6 items-center last:mb-0 first:mt-0 relative cursor-pointer"
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
      <v-ui-icon
        v-if="existsInUserOrders"
        2xs
        :icon="Icon.Arrow"
        class="text-gray-400 transform rotate-90 mr-2"
      />
      <v-ui-format-order-price
        v-bind="{
          value: price,
          type: type,
          decimals: market.priceDecimals
        }"
        class="text-right block"
      />
    </span>
    <span class="w-1/3 text-xs px-2 z-10" @click.stop="onQuantityClick">
      <v-ui-format-amount
        v-bind="{
          value: quantity.toBase(quantityScaleDecimals),
          decimals: market.quantityDecimals
        }"
        class="text-right block"
        :class="{
          'text-accent-500': quantityChange === Change.Decrease,
          'text-primary-500': quantityChange === Change.Increase
        }"
      />
    </span>
    <span class="w-1/3 text-xs px-2 z-10" @click.stop="onSumQuantityClick">
      <v-ui-format-amount
        v-bind="{
          value: sumOfQuantities,
          decimals: market.quantityDecimals
        }"
        class="text-right block text-white"
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
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
import {
  Change,
  SpotOrderSide,
  UiSpotMarket,
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
      type: String as PropType<SpotOrderSide>
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
      SpotOrderSide
    }
  },

  computed: {
    existsInUserOrders(): boolean {
      return this.userOrders.includes(this.record.price.toString())
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    recordTypeBuy(): boolean {
      const { type } = this

      return type === SpotOrderSide.Buy
    },

    priceScaleDecimals(): number {
      const { recordTypeBuy, market } = this

      if (!market) {
        return 0
      }

      return recordTypeBuy
        ? market.quoteToken.decimals
        : market.baseToken.decimals
    },

    quantityScaleDecimals(): number {
      const { recordTypeBuy, market } = this

      if (!market) {
        return 0
      }

      return recordTypeBuy
        ? market.baseToken.decimals
        : market.baseToken.decimals
    },

    price(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInBase(record.price).toWei(
          market.baseToken.decimals - market.quoteToken.decimals
        )
      )
    },

    sumOfQuantities(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(record.sumOfQuantities || 0)
    },

    quantity(): BigNumberInWei {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(record.quantity)
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

      this.$root.$emit(
        'orderbook-size-click',
        quantity.toBase(market.baseToken.decimals).toFixed()
      )
    },

    onSumQuantityClick() {
      const { sumOfQuantities, market } = this

      if (!market) {
        return
      }

      this.$root.$emit('orderbook-size-click', sumOfQuantities)
    }
  }
})
</script>
