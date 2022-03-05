<template>
  <v-table-wrapper v-if="market">
    <table v-if="filteredPositions.length > 0" class="table">
      <position-table-header />
      <tbody>
        <tr
          is="v-position"
          v-for="(position, index) in sortedPositions"
          :key="`positions-${index}-${position.marketId}`"
          :position="position"
        ></tr>
      </tbody>
    </table>
    <v-empty-list v-else :message="$t('trade.emptyPositions')" />
  </v-table-wrapper>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  UiDerivativeMarketWithToken,
  UiPosition
} from '@injectivelabs/ui-common'
import Position from '~/components/partials/common/derivatives/position.vue'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'

export default Vue.extend({
  components: {
    'v-position': Position,
    PositionTableHeader
  },

  props: {
    currentMarketOnly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      interval: 0 as any
    }
  },

  computed: {
    market(): UiDerivativeMarketWithToken | undefined {
      return this.$accessor.derivatives.market
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    filteredPositions(): UiPosition[] {
      const { currentMarketOnly, market, positions } = this

      if (!currentMarketOnly) {
        return positions
      }

      return positions.filter(
        (position) => position.marketId === market?.marketId
      )
    },

    sortedPositions(): UiPosition[] {
      const { filteredPositions } = this

      return [...filteredPositions].sort((p1: UiPosition, p2: UiPosition) => {
        return p1.ticker.localeCompare(p2.ticker)
      })
    }
  },

  mounted() {
    this.$accessor.positions.fetchOpenPositionsMarketsOrderbook()

    this.interval = setInterval(() => {
      this.$accessor.positions.fetchOpenPositionsMarketsOrderbook()
    }, 10000)
  },

  beforeDestroy() {
    clearInterval(this.interval)
  }
})
</script>
