<template>
  <HocLoading :status="status">
    <div class="w-full h-full flex flex-col">
      <VCardTableWrap>
        <template #actions>
          <div
            class="col-span-12 lg:col-span-8 grid grid-cols-5 sm:grid-cols-4 gap-4 w-full"
          >
            <TokenSelector
              class="token-selector__token-only"
              :value="selectedToken"
              :options="supportedTokens"
              :placeholder="'Search asset'"
              :balance="balance"
              dense
              rounded
              show-default-indicator
              @input:token="handleSelectToken"
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
            :key="`mobile-derivative-trade-${index}`"
            class="col-span-1"
            :trade="trade"
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
              ></tr>
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

        <ModalMobileTradeDetails :trade="tradeDetails" />
      </VCardTableWrap>

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
import { BigNumberInBase, Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiDerivativeTrade,
  UiDerivativeMarketWithToken,
  ZERO_IN_BASE,
  BankBalanceWithTokenAndBalanceInBase,
  BankBalanceWithTokenAndBalance
} from '@injectivelabs/sdk-ui-ts'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'
import { Token } from '@injectivelabs/token-metadata'
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
import TokenSelector from '@/components/partials/portfolio/bridge/token-selector/select.vue'

function stringToTradeExecutionType(
  type: string
): TradeExecutionType | undefined {
  switch (type) {
    case 'market': {
      return TradeExecutionType.Market
    }
    case 'limitFill': {
      return TradeExecutionType.LimitFill
    }
    case 'limitMatchRestingOrder': {
      return TradeExecutionType.LimitMatchRestingOrder
    }
    case 'limitMatchNewOrder': {
      return TradeExecutionType.LimitMatchNewOrder
    }
    default: {
      return undefined
    }
  }
}

function stringToTradeDirection(side: string): TradeDirection | undefined {
  switch (side) {
    case 'buy': {
      return TradeDirection.Buy
    }
    case 'taker': {
      return TradeDirection.Sell
    }
    default: {
      return undefined
    }
  }
}

export default Vue.extend({
  components: {
    Trade,
    FilterSelector,
    MobileTrade,
    ModalMobileTradeDetails,
    ModalMobileTradeFilter,
    TableBody,
    TradesTableHeader,
    Pagination,
    TokenSelector
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      type: undefined as string | undefined,
      side: undefined as string | undefined,
      tradeDetails: undefined as UiDerivativeTrade | undefined,
      status: new Status(StatusType.Loading),
      page: 1,
      limit: UI_DEFAULT_PAGINATION_LIMIT_COUNT,
      selectedToken: undefined as Token | undefined
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.subaccountTrades
    },

    filteredTrades(): UiDerivativeTrade[] {
      const {
        trades
        // search,
        // markets,
        // type,
        // side
      } = this
      return trades
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
    },

    totalCount(): number {
      return this.$store.state.derivatives.subaccountTradesTotal
    },

    totalPages(): number {
      const { totalCount, limit } = this

      return Math.ceil(totalCount / limit)
    },

    balance(): BigNumberInBase {
      return ZERO_IN_BASE
    },

    supportedTokens(): BankBalanceWithTokenAndBalanceInBase[] {
      const supportedTokens = this.$store.state.activity.supportedTokens

      return supportedTokens.filter(
        (token: BankBalanceWithTokenAndBalance) =>
          !!this.markets.find(
            (market) =>
              market.baseToken.denom === token.denom ||
              market.quoteToken.denom === token.denom
          )
      )
    },

    showClearAllButton(): boolean {
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
        this.$accessor.derivatives.fetchSubaccountTrades({
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

    // handleInputOnSearch(search: string) {
    //   this.search = search
    // },

    handleSideClick(side: string | undefined) {
      this.side = side

      this.updateTrades()
    },

    handleTypeClick(type: string | undefined) {
      this.type = type

      this.updateTrades()
    },

    handleShowTradeDetails(trade: UiDerivativeTrade) {
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

    handleSelectToken(token: Token) {
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
