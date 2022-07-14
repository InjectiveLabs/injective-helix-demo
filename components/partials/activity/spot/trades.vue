<template>
  <HocLoading :status="status">
    <VCardTableWrap>
      <template #actions>
        <div
          class="col-span-12 lg:col-span-6 grid grid-cols-5 sm:grid-cols-3 gap-4 w-full"
        >
          <VSearch
            dense
            class="col-span-3 sm:col-span-1"
            data-cy="universal-table-filter-by-asset-input"
            :placeholder="$t('trade.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />

          <div
            class="col-span-2 flex items-center bg-gray-900 rounded-full text-gray-200 py-3 px-6 text-xs cursor-pointer sm:hidden shadow-sm"
            @click="openMobileFilterModal"
          >
            <IconFilter class="min-w-4 mr-2" />
            <span>{{ $t('common.filters') }}</span>
          </div>

          <FilterSelector
            class="self-start hidden sm:block"
            data-cy="universal-table-filter-by-type-drop-down"
            :type="TradeSelectorType.Type"
            :value="type"
            @click="handleTypeClick"
          />

          <FilterSelector
            class="self-start hidden sm:block"
            data-cy="universal-table-filter-by-side-drop-down"
            :type="TradeSelectorType.Side"
            :value="side"
            @click="handleSideClick"
          />
        </div>
      </template>

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
    </VCardTableWrap>
  </HocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import { UiSpotTrade, UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import Trade from '~/components/partials/common/trade/trade.vue'
import MobileTrade from '~/components/partials/common/trade/mobile-trade.vue'
import TradesTableHeader from '~/components/partials/common/trade/trades-table-header.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import ModalMobileTradeFilter from '~/components/partials/modals/mobile-trade-filter.vue'
import ModalMobileTradeDetails from '~/components/partials/modals/mobile-trade-details.vue'
import TableBody from '~/components/elements/table-body.vue'
import { TradeSelectorType } from '~/types/enums'
import { Modal } from '~/types'

export default Vue.extend({
  components: {
    Trade,
    FilterSelector,
    MobileTrade,
    ModalMobileTradeDetails,
    ModalMobileTradeFilter,
    TradesTableHeader,
    TableBody
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      type: undefined as string | undefined,
      side: undefined as string | undefined,
      tradeDetails: undefined as UiSpotTrade | undefined,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    trades(): UiSpotTrade[] {
      return this.$accessor.spot.subaccountTrades
    },

    markets(): UiSpotMarketWithToken[] {
      return this.$accessor.spot.markets
    },

    filteredTrades(): UiSpotTrade[] {
      const { markets, search, trades, type, side } = this

      return trades.filter((t) => {
        const market = markets.find((m) => m.marketId === t.marketId)

        if (!market) {
          return false
        }

        if (!search && !type && !side) {
          return true
        }

        const isPartOfSearchFilter =
          !search ||
          market.ticker.toLowerCase().includes(search.trim().toLowerCase())

        const isMarketType = type === TradeExecutionType.Market
        const isPartOfTypeFilter =
          !type ||
          (isMarketType &&
            t.tradeExecutionType === TradeExecutionType.Market) ||
          (!isMarketType && t.tradeExecutionType !== TradeExecutionType.Market)
        const isPartOfSideFilter = !side || t.tradeDirection === side

        return isPartOfSearchFilter && isPartOfTypeFilter && isPartOfSideFilter
      })
    }
  },

  mounted() {
    this.status.setLoading()

    Promise.all([this.$accessor.spot.fetchSubaccountTrades()])
      .then(() => {
        //
      })
      .catch(this.$onError)
      .finally(() => {
        this.status.setIdle()
      })
  },

  methods: {
    handleInputOnSearch(search: string) {
      this.search = search
    },

    handleSideClick(side: string | undefined) {
      this.side = side
    },

    handleTypeClick(type: string | undefined) {
      this.type = type
    },

    handleShowTradeDetails(trade: UiSpotTrade) {
      this.tradeDetails = trade
      this.$accessor.modal.openModal(Modal.MobileTradeDetails)
    },

    openMobileFilterModal() {
      this.$accessor.modal.openModal(Modal.MobileTradeFilter)
    }
  }
})
</script>
