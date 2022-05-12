<template>
  <VHocLoading :status="status">
    <v-card-table-wrap>
      <template #actions>
        <div
          class="col-span-12 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full"
        >
          <v-search
            dense
            class="col-span-2 sm:col-span-1"
            :placeholder="$t('trade.filter')"
            :search="search"
            @searched="handleInputOnSearch"
          />

          <filter-selector
            class="self-start"
            :type="TradeSelectorType.Type"
            :value="type"
            @click="handleTypeClick"
          />

          <filter-selector
            class="self-start"
            :type="TradeSelectorType.Side"
            :value="side"
            @click="handleSideClick"
          />
        </div>
      </template>

      <v-table-wrapper break-md class="mt-4">
        <table v-if="filteredTrades.length > 0" class="table">
          <trades-table-header />
          <tbody>
            <tr
              is="v-trade"
              v-for="(trade, index) in filteredTrades"
              :key="`trades-${index}-${trade.marketId}`"
              :trade="trade"
            ></tr>
          </tbody>
        </table>
        <v-empty-list v-else :message="$t('trade.emptyTrades')" />
      </v-table-wrapper>
    </v-card-table-wrap>
  </VHocLoading>
</template>

<script lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import Vue from 'vue'
import {
  UiDerivativeTrade,
  UiDerivativeMarketWithToken
} from '@injectivelabs/ui-common'
import { TradeExecutionType } from '@injectivelabs/ts-types'
import Trade from '~/components/partials/common/derivatives/trade.vue'
import TradesTableHeader from '~/components/partials/common/derivatives/trades-table-header.vue'
import FilterSelector from '~/components/partials/common/elements/filter-selector.vue'
import { TradeSelectorType } from '~/types/enums'

export default Vue.extend({
  components: {
    'v-trade': Trade,
    TradesTableHeader,
    FilterSelector
  },

  data() {
    return {
      TradeSelectorType,
      search: '',
      type: undefined as string | undefined,
      side: undefined as string | undefined,
      status: new Status(StatusType.Loading)
    }
  },

  computed: {
    markets(): UiDerivativeMarketWithToken[] {
      return this.$accessor.derivatives.markets
    },

    trades(): UiDerivativeTrade[] {
      return this.$accessor.derivatives.trades
    },

    filteredTrades(): UiDerivativeTrade[] {
      const { trades, search, markets, type, side } = this

      return trades.filter((t) => {
        const market = markets.find((m) => m.marketId === t.marketId)

        if (!market || (!search && !type && !side)) {
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

    Promise.all([this.$accessor.derivatives.fetchSubaccountTrades()])
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
    }
  }
})
</script>
