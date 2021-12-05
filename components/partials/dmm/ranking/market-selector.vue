<template>
  <v-dropdown
    ref="dropdown"
    class="bg-gray-900 rounded-full"
    menu-class="rounded-2xl"
    selected-class="px-5 py-4"
    prevent-close
    hide-bottom-border
  >
    <template slot="title">
      <VMarketItem v-if="activeMarketId !== ''" :item="activeMarket" />
    </template>

    <div class="p-4">
      <div class="bg-gray-900 p-4 rounded-4xl">
        <VMarketItem v-if="activeMarketId !== ''" :item="activeMarket" />

        <div class="flex items-center justify-between mt-6">
          <div class="flex items-center">
            <v-button
              :class="{
                'text-gray-500': marketType !== ''
              }"
              text-sm
              class="font-normal"
              @click.stop="onSelectMarketType('')"
            >
              <span class="text-2xs uppercase font-bold">{{ $t('all') }}</span>
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
              <span class="text-2xs uppercase font-bold">
                {{ $t('perpetuals') }}
              </span>
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
              <span class="text-2xs uppercase font-bold">
                {{ $t('spots') }}
              </span>
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
              <span class="text-2xs uppercase font-bold">
                {{ $t('futures') }}
              </span>
            </v-button>
          </div>
        </div>

        <div class="w-full my-4">
          <v-search
            dense
            name="search"
            class="w-full input-light"
            :placeholder="$t('filter_markets')"
            :search="filterMarkets"
            @searched="filterMarkets = $event"
            @click.prevent
          />
        </div>

        <div class="max-h-80 overflow-y-scroll">
          <VMarketItem
            v-for="market in filteredMarkets"
            :key="`market-${market.marketId}`"
            class="v-table-row py-2 px-5"
            small
            :item="market"
            @click="handleClick"
          />
        </div>
      </div>
    </div>
  </v-dropdown>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VMarketItem from './market-item.vue'
import VSearch from '~/components/inputs/search.vue'
import Dropdown from '~/components/elements/dropdown.vue'
import { MarketType, UiEpochMarketsWithTokenMeta } from '~/types'

export default Vue.extend({
  components: {
    VMarketItem,
    VSearch,
    'v-dropdown': Dropdown
  },

  props: {
    markets: {
      type: Array as PropType<Array<UiEpochMarketsWithTokenMeta>>,
      required: true
    },

    activeMarketId: {
      type: String,
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
    activeMarket(): UiEpochMarketsWithTokenMeta {
      const { activeMarketId, markets } = this

      return markets.find(
        ({ marketId }) => activeMarketId === marketId
      ) as UiEpochMarketsWithTokenMeta
    },

    filteredMarkets(): Array<UiEpochMarketsWithTokenMeta> {
      const { filterMarkets, marketType, markets } = this

      const query = filterMarkets.toLowerCase()

      return markets.filter((market) => {
        const {
          ticker,
          token: { name }
        } = market
        const satisfiesSearchCondition =
          ticker.toLowerCase().startsWith(query) ||
          name.toLowerCase().startsWith(query)
        const marketTypeCondition = marketType
          ? market.subType === marketType
          : true

        return satisfiesSearchCondition && marketTypeCondition
      }) as Array<UiEpochMarketsWithTokenMeta>
    }
  },

  methods: {
    handleClick(item: UiEpochMarketsWithTokenMeta) {
      // @ts-ignore
      this.$refs.dropdown.onDropdownClose()
      this.$emit('click', item.marketId)
    },

    onSelectMarketType(type: MarketType | string) {
      this.marketType = this.marketType === type ? '' : type
    }
  }
})
</script>
