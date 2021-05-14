<template>
  <tr @click.stop="onRowClick">
    <td is="v-ui-table-td" xs>
      <p class="text-gray-100 text-sm">{{ market.ticker }}</p>
    </td>
    <td is="v-ui-table-td" right xs>
      <div v-if="lastTradedPrice.gt(0)" class="flex justify-end items-center">
        <v-ui-format-order-price
          v-bind="{
            value: lastTradedPrice,
            decimals: market.priceDecimals,
            type: lastTradePriceIncreased
              ? DerivativeOrderType.Buy
              : DerivativeOrderType.Sell
          }"
          class="mr-1"
        />
        <v-ui-icon
          xs
          :rotate="!lastTradePriceIncreased"
          :primary="lastTradePriceIncreased"
          :accent="!lastTradePriceIncreased"
          :icon="Icon.Arrow"
        />
      </div>
      <span v-else class="text-gray-500">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import { Change, DerivativeOrderType, UiDerivativeMarket, Icon } from '~/types'

export default Vue.extend({
  props: {
    market: {
      required: true,
      type: Object as PropType<UiDerivativeMarket>
    }
  },

  data() {
    return {
      Icon,
      DerivativeOrderType
    }
  },

  computed: {
    lastTradedPrice(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.price)
    },

    lastTradePriceIncreased(): boolean {
      const { market } = this

      if (!market) {
        return true
      }

      return [Change.Increase, Change.NoChange].includes(Change.Increase) // TODO
    }
  },

  methods: {
    onRowClick() {
      const { market } = this

      this.$emit('selected')
      this.$router.push({
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
