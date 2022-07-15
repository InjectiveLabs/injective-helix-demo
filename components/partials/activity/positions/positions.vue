<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <VCardTableWrap>
        <template #actions>
          <div
            class="col-span-12 sm:col-span-6 lg:col-span-4 grid grid-cols-5 gap-4"
          >
            <VSearch
              dense
              class="col-span-3"
              :wrapper-classes="'rounded-full'"
              :placeholder="$t('trade.filter')"
              :search="search"
              data-cy="universal-table-filter-by-asset-input"
              @searched="handleInputOnSearch"
            />
            <FilterSelector
              class="col-span-2"
              :type="TradeSelectorType.PositionSide"
              :value="side"
              data-cy="universal-table-filter-by-side-drop-down"
              @click="handleSideClick"
            />
          </div>

          <div
            v-if="filteredPositions.length > 0"
            class="col-span-12 flex justify-between items-center sm:hidden mt-3 text-xs px-3"
          >
            <span class="tracking-widest uppercase tracking-3">
              {{ $t('trade.side') }} / {{ $t('trade.market') }}
            </span>
            <span
              class="text-red-550 leading-5 cursor-pointer"
              @click.stop="handleClosePositions"
            >
              {{ $t('trade.closeAll') }}
            </span>
          </div>

          <div
            class="col-span-6 lg:col-span-8 sm:text-right mt-0 hidden sm:block"
          >
            <VButton
              v-if="filteredPositions.length > 0 && walletIsNotKeplr"
              red-outline
              md
              :status="status"
              data-cy="activity-cancel-all-button"
              @click.stop="handleClosePositions"
            >
              {{ $t('trade.closeAllPositions') }}
            </VButton>
          </div>
        </template>

        <!-- mobile table -->
        <TableBody
          :show-empty="filteredPositions.length === 0"
          class="sm:hidden mt-3 max-h-lg overflow-y-auto"
        >
          <MobilePosition
            v-for="(position, index) in sortedPositions"
            :key="`mobile-positions-${index}-${position.marketId}`"
            class="col-span-1"
            :position="position"
          />

          <EmptyList slot="empty" :message="$t('trade.emptyPositions')" />
        </TableBody>

        <TableWrapper break-md class="mt-4 hidden sm:block">
          <table v-if="filteredPositions.length > 0" class="table">
            <PositionTableHeader />
            <tbody>
              <tr
                is="Position"
                v-for="(position, index) in sortedPositions"
                :key="`positions-${index}-${position.marketId}`"
                :position="position"
              />
            </tbody>
          </table>

          <EmptyList
            v-else
            data-cy="universal-table-nothing-found"
            :message="$t('trade.emptyPositions')"
            class="min-h-orders"
          />
        </TableWrapper>

        <portal to="activity-card-position-count">
          <span class="font-semibold text-sm md:text-lg">
            {{ positions.length }}
          </span>
        </portal>

        <portal to="activity-tab-position-count">
          <span v-if="status.isNotLoading()"> ({{ positions.length }}) </span>
        </portal>
      </VCardTableWrap>

      <!-- <Pagination
        v-if="status.isIdle()"
        class="mt-4"
        v-bind="{
          limit,
          page,
          totalPages,
          totalCount
        }"
        @update:limit="handleLimitChangeEvent"
        @update:page="handlePageChangeEvent"
      /> -->
    </div>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiPosition,
  UiDerivativeMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { Wallet } from '@injectivelabs/ts-types'
import Position from '~/components/partials/common/position/position.vue'
import PositionTableHeader from '~/components/partials/common/position/position-table.header.vue'
import MobilePosition from '~/components/partials/common/position/mobile-position.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'
// import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    Position,
    FilterSelector,
    MobilePosition,
    PositionTableHeader,
    TableBody
    // Pagination
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading),
      poll: undefined as any,
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT
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
    },

    totalCount(): number {
      return 10
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    }
  },

  mounted() {
    this.pollSubaccountPositions()

    this.updatePositions()
      .then(() => {
        this.$root.$emit('position-tab-loaded')
      })
  },

  beforeDestroy() {
    clearInterval(this.poll)
  },

  methods: {
    updatePositions(): Promise<void> {
      this.status.setLoading()

      return Promise.all([
        this.$accessor.derivatives.fetchSubaccountOrders(),
        this.$accessor.positions.fetchSubaccountPositions(
          // {
          //   skip: (this.page - 1) * this.limit,
          //   limit: this.limit
          // }
        )
      ])
        .catch(this.$onError)
        .then(() => {
          this.status.setIdle()
        })
    },

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

    pollSubaccountPositions() {
      this.poll = setInterval(() => {
        this.$accessor.positions.fetchSubaccountPositions(
          // {
          //   skip: (this.page - 1) * this.limit,
          //   limit: this.limit
          // }
        )
      }, 30 * 1000)
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.updatePositions()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.updatePositions()
    }
  }
})
</script>
