<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <Toolbar>
        <template #filters>
          <SearchAsset
            :markets="markets"
            :value="selectedToken"
            @select="handleSearch"
          />

          <FilterSelector
            class="min-w-3xs"
            :type="TradeSelectorType.PositionSide"
            :value="side"
            data-cy="universal-table-filter-by-side-drop-down"
            @click="handleSideClick"
          />

          <ClearFiltersButton
            v-if="showClearFiltersButton"
            @clear="handleClearFilters"
          />
        </template>

        <template #actions>
          <div
            class="col-span-4 md:col-span-3 lg:col-span-2 sm:text-right mt-0 hidden sm:block"
          >
            <VButton
              v-if="positions.length > 0 && walletIsNotKeplr"
              red-outline
              md
              :status="status"
              data-cy="activity-cancel-all-button"
              class="rounded"
              @click.stop="handleClosePositions"
            >
              {{ $t('trade.closeAllPositions') }}
            </VButton>
          </div>
        </template>
      </Toolbar>

      <!-- mobile table -->
      <TableBody
        :show-empty="positions.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <MobilePosition
          v-for="(position, index) in positions"
          :key="`mobile-positions-${index}-${position.marketId}`"
          class="col-span-1"
          :position="position"
        />

        <EmptyList slot="empty" :message="$t('trade.emptyPositions')" />
      </TableBody>

      <TableWrapper break-md class="mt-4 hidden sm:block">
        <table v-if="positions.length > 0" class="table">
          <PositionTableHeader />
          <tbody>
            <tr
              is="Position"
              v-for="(position, index) in positions"
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

      <Pagination
        v-if="status.isIdle() && positions.length > 0"
        class="mt-4"
        v-bind="{
          limit,
          page,
          totalPages,
          totalCount
        }"
        @update:limit="handleLimitChangeEvent"
        @update:page="handlePageChangeEvent"
      />
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
import { TradeDirection, Wallet } from '@injectivelabs/ts-types'
import { Token } from '@injectivelabs/token-metadata'
import Position from '~/components/partials/common/position/position.vue'
import PositionTableHeader from '~/components/partials/common/position/position-table.header.vue'
import MobilePosition from '~/components/partials/common/position/mobile-position.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import SearchAsset from '@/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '@/components/partials/activity/common/clear-filters-button.vue'
import Toolbar from '@/components/partials/activity/common/toolbar.vue'

export default Vue.extend({
  components: {
    Position,
    FilterSelector,
    MobilePosition,
    PositionTableHeader,
    TableBody,
    Pagination,
    SearchAsset,
    ClearFiltersButton,
    Toolbar
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading),
      poll: undefined as any,
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
      selectedToken: undefined as Token | undefined
    }
  },

  computed: {
    activeMarketIds(): string[] {
      return this.$accessor.derivatives.activeMarketIds
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    positions(): UiPosition[] {
      return this.$accessor.positions.subaccountPositions
    },

    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    totalCount(): number {
      return this.$accessor.positions.subaccountPositionsPagination.total
    },

    walletIsNotKeplr(): boolean {
      const { wallet } = this

      return wallet !== Wallet.Keplr
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken || !!this.side
    },

    skip(): number {
      const { page, limit } = this

      return (page - 1) * limit
    }
  },

  mounted() {
    this.pollSubaccountPositions()

    this.fetchPositions().then(() => {
      this.$root.$emit('position-tab-loaded')
    })
  },

  beforeDestroy() {
    clearInterval(this.poll)
  },

  methods: {
    fetchPositions(): Promise<void> {
      this.status.setLoading()

      return Promise.all([
        this.$accessor.derivatives.fetchSubaccountOrders(),
        this.fetchSubaccountPositions()
      ])
        .catch(this.$onError)
        .then(() => {
          this.status.setIdle()
        })
    },

    fetchSubaccountPositions() {
      const { side, markets, skip, limit, activeMarketIds: marketIds } = this

      const direction = side as TradeDirection
      const marketId = markets.find((m) => {
        return (
          m.baseToken.symbol === this.selectedToken?.symbol ||
          m.quoteToken.symbol === this.selectedToken?.symbol
        )
      })?.marketId

      return this.$accessor.positions.fetchSubaccountPositions({
        pagination: {
          skip,
          limit
        },
        filters: {
          marketId,
          marketIds,
          direction
        }
      })
    },

    closeAllPositions(): Promise<void> {
      const { positions } = this

      return this.$accessor.positions.closeAllPosition(positions)
    },

    closePosition(): Promise<void> {
      const { positions, markets } = this
      const [position] = positions

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
      const { positions } = this

      this.status.setLoading()

      const action =
        positions.length === 1 ? this.closePosition : this.closeAllPositions

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

      this.fetchPositions()
    },

    pollSubaccountPositions() {
      this.poll = setInterval(this.fetchSubaccountPositions, 30 * 1000)
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.fetchPositions()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.fetchPositions()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.fetchPositions()
    },

    handleClearFilters() {
      this.selectedToken = undefined
      this.side = undefined
      this.page = 1

      this.fetchPositions()
    }
  }
})
</script>
