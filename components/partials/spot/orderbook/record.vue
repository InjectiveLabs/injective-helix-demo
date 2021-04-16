<template>
  <li
    v-if="market"
    class="flex py-1 last:mb-0 first:mt-0 relative cursor-pointer"
  >
    <span class="size-col" :class="newRecordClass"></span>
    <span
      class="depth-col"
      :style="depthWidth"
      :class="type === SpotOrderType.Buy ? 'buys' : 'sells'"
    ></span>
    <span
      class="w-1/3 text-xs px-2 flex items-center justify-end z-10"
      @click.stop="onPriceClick"
    >
      <v-ui-icon
        v-if="existsInUserOrders"
        2xs
        :icon="$enums.Icon.Arrow"
        class="text-gray-400 transform rotate-90 mr-2"
      />
      <v-ui-format-order-price
        v-bind="{
          value: price.toBase(market.quoteToken.decimals),
          type: type,
          decimals: market.maxPriceScaleDecimals
        }"
        class="text-right block"
      />
    </span>
    <span class="w-1/3 text-xs px-2 z-10" @click.stop="onQuantityClick">
      <v-ui-format-amount
        v-bind="{
          value: quantity,
          decimals: market.maxQuantityScaleDecimals
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
          decimals: market.maxQuantityScaleDecimals
        }"
        class="text-right block text-white"
      />
    </span>
  </li>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import {
  BigNumberInWei,
  BigNumberInBase,
  BigNumber
} from '@injectivelabs/utils'
import { ZERO_IN_BASE, ZERO_IN_WEI } from '~/app/utils/constants'
import {
  Change,
  SpotOrderType,
  UiSpotMarket,
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
      type: String as PropType<SpotOrderType>
    },

    record: {
      required: true,
      type: Object as PropType<UiOrderbookPriceLevel>
    }
  },

  data() {
    return {
      Change,
      SpotOrderType
    }
  },

  computed: {
    existsInUserOrders(): boolean {
      return this.userOrders.includes(this.record.price.toString())
    },

    market(): UiSpotMarket | undefined {
      return this.$accessor.spot.market
    },

    price(): BigNumberInWei {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_WEI
      }

      return new BigNumberInWei(record.price)
    },

    sumOfQuantities(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(record.sumOfQuantities || 0)
    },

    quantity(): BigNumberInBase {
      const { market, record } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(record.price)
    },

    depthWidth(): { width: string } {
      const { record } = this

      return {
        width: `${record.depth}%`
      }
    },

    newRecordClass(): string {
      const { quantityChange, type } = this
      const { Change } = this.$enums

      switch (quantityChange) {
        case Change.NoChange:
          return ''
        case Change.New:
          return type === SpotOrderType.Buy ? 'up' : 'down'
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

      const priceToString = price
        .toBase(market.quoteToken.decimals)
        .toFixed(market.maxPriceScaleDecimals)

      this.$root.$emit('orderbook-price-click', priceToString)
    },

    onQuantityClick() {
      const { quantity, market } = this

      if (!market) {
        return
      }

      this.$root.$emit(
        'orderbook-size-click',
        quantity.toFixed(market.maxQuantityScaleDecimals)
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
