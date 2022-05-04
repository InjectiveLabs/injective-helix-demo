<template>
  <VHocLoading :status="status">
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

        <div
          class="col-span-12 sm:col-span-6 lg:col-span-8 sm:text-right mt-4 sm:mt-0"
        >
          <v-button
            v-if="filteredPositions.length > 0 && walletIsNotKeplr"
            red-outline
            md
            :status="status"
            @click.stop="handleClosePositions"
          >
            {{ $t('trade.closeAllPositions') }}
          </v-button>
        </div>
      </template>

      <v-table-wrapper break-md class="mt-4">
        <table v-if="filteredPositions.length > 0" class="table">
          <position-table-header />
          <tbody>
            <tr
              is="v-position"
              v-for="(position, index) in sortedPositions"
              :key="`positions-${index}-${position.marketId}`"
              :position="position"
            />
          </tbody>
        </table>

        <v-empty-list
          v-else
          :message="$t('trade.emptyPositions')"
          class="mt-6 min-h-orders"
        />
      </v-table-wrapper>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiPosition,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import { Wallet } from '@injectivelabs/ts-types'
import Position from '~/components/partials/common/derivatives/position.vue'
import PositionTableHeader from '~/components/partials/common/derivatives/position-table.header.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
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
      status: new Status(StatusType.Loading),
      poll: undefined as any
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

        if (!market || (!search && !side)) {
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

  mounted() {
    this.status.setLoading()

    Promise.all([
      this.$accessor.derivatives.fetchSubaccountOrders(),
      this.$accessor.positions.fetchMarketsOrderbook(),
      this.$accessor.positions.fetchSubaccountPositions()
    ])
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })

    this.pollOrderbooks()
  },

  beforeDestroy() {
    clearInterval(this.poll)
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
    },

    pollOrderbooks() {
      this.poll = setInterval(() => {
        this.$accessor.positions.fetchSubaccountPositions() // refresh mark price
        this.$accessor.positions.fetchMarketsOrderbook()
      }, 30 * 1000)
    }
  }
})
</script>
