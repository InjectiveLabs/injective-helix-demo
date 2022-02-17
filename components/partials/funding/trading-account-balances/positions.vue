<template>
  <v-card-table-wrap>
    <template #actions>
      <div
        class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
      >
        <v-search
          dense
          class="col-span-3"
          :placeholder="$t('trade.filter')"
          :search="search"
          @searched="handleInputOnSearch"
        />
        <filter-selector
          class="col-span-2"
          :type="TradeSelectorType.PositionSide"
          :value="side"
          @click="handleSideClick"
        />
      </div>

      <div class="col-span-12 sm:col-span-6 lg:col-span-8 sm:text-right">
        <v-button
          v-if="positions.length > 0 && isUserWalletConnected"
          red-outline
          md
          :status="status"
          @click.stop="handleClosePositions"
        >
          {{ $t('trade.closeAllPositions') }}
        </v-button>
      </div>
    </template>

    <div class="table-responsive min-h-orders max-h-lg mt-6">
      <table v-if="filteredPositions.length > 0" class="table">
        <position-table-header market-column-enabled />
        <tbody v-if="isUserWalletConnected">
          <tr
            is="v-position"
            v-for="(position, index) in filteredPositions"
            :key="`positions-${index}-${position.marketId}`"
            :position="position"
          ></tr>
        </tbody>
      </table>

      <div v-else class="min-h-orders w-full bg-gray-900 flex">
        <div class="grow text-center m-auto">
          <img src="/svg/empty-list.svg" class="mx-auto mb-2" />
          <p>{{ $t('trade.emptyPositions') }}</p>
        </div>
      </div>
    </div>
  </v-card-table-wrap>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiPosition,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import Position from '~/components/partials/common/derivatives/position.vue'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'
import FilterSelector from '~/components/partials/common/trades/trade-dropdown-filter.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    'v-position': Position,
    FilterSelector,
    PositionTableHeader
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      side: undefined as string | undefined,
      status: new Status(StatusType.Idle)
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    filteredPositions(): UiPosition[] {
      const { positions, markets, search, side } = this

      return positions.filter((p) => {
        const market = markets.find((m) => m.marketId === p.marketId)

        if (!market || (!search && !side)) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          market.ticker.toLowerCase().includes(search.trim().toLowerCase())
        const isPartOfSideFilter = !side || p.direction === side

        return isPartOfSearchFilter && isPartOfSideFilter
      })
    }
  },

  methods: {
    handleClosePositions() {
      const { positions } = this

      this.status.setLoading()

      this.$accessor.positions
        .closeAllPosition(positions)
        .then(() => {
          this.$toast.success(this.$t('activities.closePositionsSuccess'))
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleInputOnSearch(search: string) {
      this.search = search
    },

    handleSideClick(side: string | undefined) {
      this.side = side
    }
  }
})
</script>
