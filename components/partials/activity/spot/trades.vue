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

          <div
            class="col-span-2 flex items-center bg-gray-900 rounded-full text-gray-200 py-3 px-6 text-xs cursor-pointer sm:hidden shadow-sm"
            @click="openMobileFilterModal"
          >
            <IconFilter class="min-w-4 mr-2" />
            <span>{{ $t('common.filters') }}</span>
          </div>

          <FilterSelector
            class="col-span-3 hidden sm:block"
            data-cy="universal-table-filter-by-type-drop-down"
            :type="TradeSelectorType.Type"
            :value="type"
            @click="handleTypeClick"
          />

          <FilterSelector
            class="col-span-3 hidden sm:block"
            data-cy="universal-table-filter-by-side-drop-down"
            :type="TradeSelectorType.Side"
            :value="side"
            @click="handleSideClick"
          />

          <ClearFiltersButton
            v-if="showClearFiltersButton"
            @clear="handleClearFilters"
          />
        </template>
      </Toolbar>

      <!-- mobile table -->
      <TableBody
        :show-empty="filteredTrades.length === 0"
        class="sm:hidden mt-3 max-h-lg overflow-y-auto"
      >
        <MobileTrade
          v-for="(trade, index) in filteredTrades"
          :key="`mobile-spot-trade-${index}`"
          class="col-span-1"
          :trade="trade"
          is-spot
          @showTradeDetails="handleShowTradeDetails"
        />

        <EmptyList slot="empty" :message="$t('trade.emptyTrades')" />
      </TableBody>

      <TableWrapper break-md class="mt-4 hidden sm:block">
        <table v-if="filteredTrades.length > 0" class="table">
          <TradesTableHeader />
          <tbody>
            <tr
              is="Trade"
              v-for="(trade, index) in filteredTrades"
              :key="`trade-${index}`"
              :trade="trade"
              is-spot
            />
          </tbody>
        </table>
        <EmptyList
          v-else
          :message="$t('trade.emptyTrades')"
          data-cy="universal-table-nothing-found"
        />
      </TableWrapper>

      <ModalMobileTradeFilter
        :type="type"
        :side="side"
        @type:update="handleTypeClick"
        @side:update="handleSideClick"
      />

      <ModalMobileTradeDetails is-spot :trade="tradeDetails" />

      <Pagination
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
      />
    </div>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiSpotTrade, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import {
  stringToTradeDirection,
  stringToTradeExecutionType
} from '@/components/partials/activity/common/utils'
import Trade from '~/components/partials/common/trade/trade.vue'
import MobileTrade from '~/components/partials/common/trade/mobile-trade.vue'
import TradesTableHeader from '~/components/partials/common/trade/trades-table-header.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import ModalMobileTradeFilter from '~/components/partials/modals/mobile-trade-filter.vue'
import ModalMobileTradeDetails from '~/components/partials/modals/mobile-trade-details.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'
import { Modal } from '~/types'
import Pagination from '~/components/partials/common/pagination.vue'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '~/app/utils/constants'
import SearchAsset from '@/components/partials/activity/common/search-asset.vue'
import ClearFiltersButton from '@/components/partials/activity/common/clear-filters-button.vue'
import Toolbar from '@/components/partials/activity/common/toolbar.vue'

export default Vue.extend({
  components: {
    Trade,
    FilterSelector,
    MobileTrade,
    ModalMobileTradeDetails,
    ModalMobileTradeFilter,
    TradesTableHeader,
    TableBody,
    Pagination,
    SearchAsset,
    ClearFiltersButton,
    Toolbar
  },

  data() {
    return {
      TradeSelectorType,
      type: undefined as string | undefined,
      side: undefined as string | undefined,
      tradeDetails: undefined as UiSpotTrade | undefined,
      status: new Status(StatusType.Loading),
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
      selectedToken: undefined as Token | undefined
    }
  },

  computed: {
    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    trades(): UiSpotTrade[] {
      return this.$accessor.spot.subaccountTrades
    },

    filteredTrades(): UiSpotTrade[] {
      const {
        trades
        // markets,
        // search,
        // type,
        // side
      } = this

      // return trades.filter((t) => {
      //   const market = markets.find((m) => m.marketId === t.marketId)
      //   if (!market) {
      //     return false
      //   }
      //   if (!search && !type && !side) {
      //     return true
      //   }
      //   const isPartOfSearchFilter =
      //     !search ||
      //     market.ticker.toLowerCase().includes(search.trim().toLowerCase())
      //   const isMarketType = type === TradeExecutionType.Market
      //   const isPartOfTypeFilter =
      //     !type ||
      //     (isMarketType &&
      //       t.tradeExecutionType === TradeExecutionType.Market) ||
      //     (!isMarketType && t.tradeExecutionType !== TradeExecutionType.Market)
      //   const isPartOfSideFilter = !side || t.tradeDirection === side
      //   return isPartOfSearchFilter && isPartOfTypeFilter && isPartOfSideFilter
      // })

      return trades
    },

    totalCount(): number {
      return this.$accessor.spot.subaccountTradesTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    showClearFiltersButton(): boolean {
      return !!this.selectedToken || !!this.type || !!this.side
    }
  },

  mounted() {
    this.updateTrades()
  },

  methods: {
    updateTrades() {
      this.status.setLoading()

      const type = this.type ? stringToTradeExecutionType(this.type) : undefined

      const direction = this.side
        ? stringToTradeDirection(this.side)
        : undefined

      const marketId = this.markets.find((m) => {
        return (
          m.baseToken.symbol === this.selectedToken?.symbol ||
          m.quoteToken.symbol === this.selectedToken?.symbol
        )
      })?.marketId

      const marketIds = this.markets.map((market) => market.marketId)

      Promise.all([
        this.$accessor.spot.fetchSubaccountTrades({
          pagination: {
            skip: (this.page - 1) * this.limit,
            limit: this.limit
          },
          filters: {
            type,
            direction,
            marketId,
            marketIds
          }
        })
      ])
        .then(() => {
          //
        })
        .catch(this.$onError)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleSideClick(side: string | undefined) {
      this.side = side

      this.updateTrades()
    },

    handleTypeClick(type: string | undefined) {
      this.type = type

      this.updateTrades()
    },

    handleShowTradeDetails(trade: UiSpotTrade) {
      this.tradeDetails = trade

      this.$accessor.modal.openModal(Modal.MobileTradeDetails)
    },

    openMobileFilterModal() {
      this.$accessor.modal.openModal(Modal.MobileTradeFilter)
    },

    handleLimitChangeEvent(limit: number) {
      this.limit = limit

      this.updateTrades()
    },

    handlePageChangeEvent(page: number) {
      this.page = page

      this.updateTrades()
    },

    handleSearch(token: Token) {
      this.selectedToken = token

      this.updateTrades()
    },

    handleClearFilters() {
      this.selectedToken = undefined
      this.side = undefined
      this.type = undefined

      this.updateTrades()
    }
  }
})
</script>
