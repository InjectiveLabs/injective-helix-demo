<template>
  <div>
    <div class="w-full">
      <v-search
        name="search"
        class="w-full"
        :placeholder="$t('filter_markets')"
        :search="filterMarkets"
        @searched="filterMarkets = $event"
      />
    </div>
    <div class="overflow-x-auto lg:overflow-x-visible w-full mt-6">
      <TableHeader v-if="markets.length !== 0" sm>
        <span class="col-span-3">{{ $t('market') }}</span>
        <span class="col-span-3">
          <div class="flex items-center">
            <span class="flex-1 text-right">{{ $t('last_traded_price') }}</span>
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('last_traded_price Tooltip')"
            />
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('market_change_24h') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('market_change_24h Tooltip')"
            />
          </div>
        </span>
        <span class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('market_volume_24h') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('market_volume_24h Tooltip')"
            />
          </div>
        </span>
      </TableHeader>

      <TableBody :show-empty="markets.length === 0">
        <v-market
          v-for="({ market, summary }, index) in filteredMarkets"
          :key="`market-${index}`"
          class="col-span-1"
          :market="market"
          :summary="summary"
          :type="type"
        />
        <template slot="empty">
          <span class="col-span-1 xl:col-span-3 text-center xl:text-left">{{
            $t('There are no results found - Markets')
          }}</span>
        </template>
      </TableBody>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TableBody from '~/components/partials/common/elements/table-body.vue'
import TableHeader from '~/components/partials/common/elements/table-header.vue'
import VSearch from '~/components/inputs/search.vue'
import VMarket from '~/components/partials/common/markets/market.vue'
import {
  MarketType,
  UiDerivativeMarket,
  UiDerivativeMarketSummary,
  UiSpotMarket,
  UiSpotMarketSummary
} from '~/types'

export interface UiMarketAndSummary {
  market: UiDerivativeMarket | UiSpotMarket
  summary: UiDerivativeMarketSummary | UiSpotMarketSummary
}

export default Vue.extend({
  components: {
    TableBody,
    TableHeader,
    VSearch,
    VMarket
  },

  props: {
    markets: {
      type: Array as PropType<Array<UiDerivativeMarket | UiSpotMarket>>,
      required: true
    },

    summaries: {
      type: Array as PropType<
        Array<UiDerivativeMarketSummary | UiSpotMarketSummary>
      >,
      required: true
    },

    type: {
      required: true,
      type: String as PropType<MarketType>
    }
  },

  data() {
    return {
      filterMarkets: ''
    }
  },

  computed: {
    filteredMarkets(): UiMarketAndSummary[] {
      const { filterMarkets, markets, summaries } = this

      const query = filterMarkets.toLowerCase()

      return markets
        .map((market) => {
          return {
            market,
            summary: summaries.find(
              (summary) => summary.marketId === market.marketId
            )
          }
        })
        .filter(({ market, summary }) => {
          const { ticker, quoteDenom } = market
          const satisfiesSearchCondition =
            quoteDenom.toLowerCase().startsWith(query) ||
            ticker.toLowerCase().startsWith(query)

          return satisfiesSearchCondition && summary !== undefined
        }) as UiMarketAndSummary[]
    }
  }
})
</script>
