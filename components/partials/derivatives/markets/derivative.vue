<template>
  <tr @click.stop="onRowClick">
    <td is="v-ui-table-td">
      <span class="text-gray-100 font-semibold text-sm">{{
        market.ticker
      }}</span>
    </td>
    <td is="v-ui-table-td" right class="font-normal">
      <div v-if="lastTradedPrice.gt(0)" class="flex justify-end items-center">
        <v-ui-format-price
          v-bind="{
            value: lastTradedPrice,
            decimals: market.priceDecimals,
            class: {
              'text-primary-500': lastPriceChange === Change.Increase,
              'text-accent-500': lastPriceChange === Change.Decrease
            }
          }"
          class="mr-1"
        />
        <v-ui-icon
          v-if="[Change.New, Change.NoChange].includes(lastPriceChange)"
          xs
          :rotate="lastPriceChange === Change.Decrease"
          :primary="lastPriceChange === Change.Increase"
          :accent="lastPriceChange === Change.Decrease"
          :icon="Icon.Arrow"
        />
      </div>
      <span v-else class="text-gray-500">&mdash;</span>
    </td>
    <td is="v-ui-table-td" right class="font-normal">
      <v-ui-text sm class="text-right">
        <v-ui-format-percent
          v-bind="{
            appendPlusSign: true,
            precision: 2,
            value: change.toFixed(),
            class: change.gte(0) ? 'text-primary-500' : 'text-accent-500'
          }"
        />
      </v-ui-text>
    </td>
    <td is="v-ui-table-td" right class="font-normal">
      <v-ui-text v-if="volume.gt(0)" class="flex items-center justify-end">
        <v-ui-format-number
          v-bind="{
            dontGroupValues: true,
            value: volume,
            decimals: 0
          }"
        />
        <small class="text-xs font-normal text-gray-500 ml-1">{{
          market.quoteToken.symbol
        }}</small>
      </v-ui-text>
      <span v-else class="text-gray-500">&mdash;</span>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import { UiDerivativeMarket, Icon, Change } from '~/types'

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
      Change
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

    volume(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(
        new BigNumberInWei(market.volume)
          .toBase(market.quoteToken.decimals)
          .dp(0)
          .toFixed()
      )
    },

    change(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.change)
    },

    lastPriceChange(): Change {
      const { market } = this

      if (!market) {
        return Change.NoChange
      }

      if (!market.lastPrice) {
        return Change.NoChange
      }

      return new BigNumberInBase(market.price).gte(market.lastPrice)
        ? Change.Increase
        : Change.Decrease
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
