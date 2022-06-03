<template>
  <v-card-table-wrap>
    <template #actions>
      <div
        class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
      >
        <v-search
          dense
          class="col-span-3"
          data-cy="universal-table-filter-by-asset-input"
          :placeholder="$t('trade.filter')"
          :search="search"
          @searched="handleInputOnSearch"
        />
        <filter-selector
          class="col-span-2"
          data-cy="universal-table-filter-by-side-select"
          :type="TradeSelectorType.PositionSide"
          :value="side"
          @click="handleSideClick"
        />
      </div>

      <div
        class="col-span-12 flex justify-between items-center sm:hidden my-3 text-xs px-3"
      >
        <span class="tracking-widest uppercase tracking-3">
          {{ $t('trade.side') }} / {{ $t('trade.market') }}
        </span>
        <span
          class="text-red-550 leading-5 cursor-pointer"
          data-cy="trading-account-positions-table-cancel-all-button"
          @click.stop="handleClosePositions"
        >
          {{ $t('trade.closeAll') }}
        </span>
      </div>

      <div
        class="col-span-6 lg:col-span-8 sm:text-right mt-4 sm:mt-0 hidden sm:block"
      >
        <v-button
          v-if="
            filteredPositions.length > 0 && walletIsNotKeplr && !hideBalance
          "
          data-cy="trading-account-positions-table-cancel-all-button"
          red-outline
          md
          :status="status"
          @click.stop="handleClosePositions"
        >
          {{ $t('trade.closeAllPositions') }}
        </v-button>
      </div>
    </template>

    <!-- mobile table -->
    <TableBody
      :show-empty="filteredPositions.length === 0"
      class="sm:hidden max-h-lg overflow-y-auto"
    >
      <mobile-position
        v-for="(position, index) in sortedPositions"
        :key="`mobile-positions-${index}-${position.marketId}`"
        class="col-span-1"
        :position="position"
      />

      <v-empty-list
        slot="empty"
        :message="$t('trade.emptyPositions')"
        class="min-h-orders"
      />
    </TableBody>

    <div class="overflow-y-auto mt-4 hidden sm:block">
      <table v-if="filteredPositions.length > 0" class="table relative">
        <position-table-header />
        <tbody>
          <tr
            is="v-position"
            v-for="(position, index) in sortedPositions"
            :key="`positions-${index}-${position.marketId}`"
            :position="position"
            :hide-balance="hideBalance"
          />
        </tbody>
      </table>

      <v-empty-list
        v-else
        :message="$t('trade.emptyPositions')"
        class="min-h-orders"
      />
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
import { Wallet } from '@injectivelabs/ts-types'
import MobilePosition from '~/components/partials/common/position/mobile-position.vue'
import Position from '~/components/partials/common/position/position.vue'
import PositionTableHeader from '~/components/partials/common/position/position-table.header.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    'v-position': Position,
    FilterSelector,
    MobilePosition,
    PositionTableHeader,
    TableBody
  },

  props: {
    hideBalance: {
      type: Boolean,
      default: false
    }
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
    wallet(): Wallet {
      return this.$accessor.wallet.wallet
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

        if (!market) {
          return false
        }

        if (!search && !side) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          market.ticker.toLowerCase().includes(search.trim().toLowerCase())
        const isPartOfSideFilter = !side || p.direction === side

        return isPartOfSearchFilter && isPartOfSideFilter
      })
    },

    sortedPositions(): UiPosition[] {
      const { filteredPositions } = this

      return [...filteredPositions].sort((p1: UiPosition, p2: UiPosition) => {
        return p1.ticker.localeCompare(p2.ticker)
      })
    },

    walletIsNotKeplr(): boolean {
      const { wallet } = this

      return wallet !== Wallet.Keplr
    }
  },

  methods: {
    closeAllPositions(): Promise<void> {
      const { filteredPositions } = this

      return this.$accessor.positions.closeAllPosition(filteredPositions)
    },

    closePosition(): Promise<void> {
      const { filteredPositions, markets } = this

      const [position] = filteredPositions
      const market = markets.find((m) => m.marketId === position.marketId)

      if (!market) {
        return Promise.reject(
          new Error(
            this.$t('trade.position_market_not_found', {
              marketId: position.marketId
            })
          )
        )
      }

      return this.$accessor.positions.closePosition({
        position,
        market
      })
    },

    handleClosePositions() {
      const { filteredPositions } = this

      this.status.setLoading()

      const action =
        filteredPositions.length === 1
          ? this.closePosition
          : this.closeAllPositions

      action()
        .then(() => {
          this.$toast.success(this.$t('trade.positions_closed'))
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
