<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <v-button
          :class="{
            'text-gray-500': marketType !== ''
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelectMarketType('')"
        >
          <span>{{ $t('all') }}</span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-700"></div>
        <v-button
          :class="{
            'text-gray-500': marketType !== MarketType.Perpetual
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelectMarketType(MarketType.Perpetual)"
        >
          <span>{{ $t('perpetuals') }}</span>
        </v-button>
        <div class="mx-2 w-px h-4 bg-gray-700"></div>
        <v-button
          :class="{
            'text-gray-500': marketType !== MarketType.Spot
          }"
          text-sm
          class="font-normal"
          @click.stop="onSelectMarketType(MarketType.Spot)"
        >
          <span>{{ $t('spots') }}</span>
        </v-button>
        <div class="hidden md:block mx-2 w-px h-4 bg-gray-700"></div>
        <v-button
          :class="{
            'text-gray-500': marketType !== MarketType.Futures
          }"
          text-sm
          class="hidden md:block font-normal opacity-50"
          @click.stop="() => {}"
        >
          <span>{{ $t('futures') }}</span>
        </v-button>
      </div>
    </div>
    <div class="w-full mt-2">
      <v-search
        name="search"
        class="w-full"
        :placeholder="$t('filter_markets')"
        :search="filterMarkets"
        @searched="filterMarkets = $event"
      />
    </div>
    <div
      class="overflow-y-auto overflow-x-auto md:overflow-x-visible w-full mt-6"
      :class="{
        'max-h-lg lg:max-h-xl': !simple,
        'h-full': simple
      }"
    >
      <TableHeader v-if="markets.length !== 0" sm>
        <span
          class="text-left"
          :class="{ 'col-span-4': simple, 'col-span-3': !simple }"
        >
          {{ $t('market') }}
        </span>
        <span :class="{ 'col-span-4': simple, 'col-span-3': !simple }">
          <div class="flex items-center relative justify-end">
            <span class="flex-1 text-right">{{ $t('last_traded_price') }}</span>
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('last_traded_price_tooltip')"
            />
          </div>
        </span>
        <span :class="{ 'col-span-4': simple, 'col-span-3': !simple }">
          <div class="flex items-center relative justify-end">
            {{ $t('market_change_24h') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('market_change_24h_tooltip')"
            />
          </div>
        </span>
        <span v-if="!simple" class="col-span-3">
          <div class="flex items-center relative justify-end">
            {{ $t('market_volume_24h') }}
            <v-icon-info-tooltip
              class="ml-2"
              :tooltip="$t('market_volume_24h_tooltip')"
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
          :simple="simple"
        />
        <template slot="empty">
          <span class="col-span-1 md:col-span-3 text-center xl:text-left">{{
            $t('There are no results found - Markets')
          }}</span>
        </template>
      </TableBody>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TableBody from '~/components/elements/table-body.vue'
import TableHeader from '~/components/elements/table-header.vue'
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
    simple: {
      required: false,
      default: false,
      type: Boolean
    },

    markets: {
      type: Array as PropType<Array<UiDerivativeMarket | UiSpotMarket>>,
      required: true
    },

    summaries: {
      type: Array as PropType<
        Array<UiDerivativeMarketSummary | UiSpotMarketSummary>
      >,
      required: true
    }
  },

  data() {
    return {
      MarketType,
      marketType: '',
      filterMarkets: ''
    }
  },

  computed: {
    filteredMarkets(): UiMarketAndSummary[] {
      const { filterMarkets, marketType, markets, summaries } = this

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
          const marketTypeCondition = marketType
            ? market.subType === marketType
            : true

          return (
            satisfiesSearchCondition &&
            summary !== undefined &&
            marketTypeCondition
          )
        }) as UiMarketAndSummary[]
    }
  },

  methods: {
    onSelectMarketType(type: MarketType | string) {
      this.marketType = this.marketType === type ? '' : type
    }
  }
})
</script>
