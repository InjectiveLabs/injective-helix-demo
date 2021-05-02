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
            decimals: market.maxPriceScaleDecimals,
            class: {
              'text-primary-500': lastTradePriceIncreased,
              'text-accent-500': !lastTradePriceIncreased
            }
          }"
          class="mr-1"
        />
        <v-ui-icon
          v-if="lastTradePriceIncreased"
          xs
          :rotate="!lastTradePriceIncreased"
          :primary="lastTradePriceIncreased"
          :accent="!lastTradePriceIncreased"
          :icon="$enums.Icon.Arrow"
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
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from '~/app/utils/constants'
import { UiSpotMarket, Change } from '~/types'

export default Vue.extend({
  props: {
    market: {
      required: true,
      type: Object as PropType<UiSpotMarket>
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

      return new BigNumberInBase(market.volume)
    },

    change(): BigNumberInBase {
      const { market } = this

      if (!market) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(market.change)
    },

    lastTradePriceIncreased(): boolean {
      const { market } = this

      if (!market) {
        return true
      }

      return [
        this.$enums.Change.Increase,
        this.$enums.Change.NoChange
      ].includes(Change.Increase) // TODO
    }
  },

  methods: {
    onRowClick() {
      const { market } = this

      this.$emit('selected')
      this.$router.push({
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
