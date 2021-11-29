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
      <VMarketItem v-if="selectedMarket" :item="selectedMarket" />
    </template>

    <div class="p-4">
      <div class="bg-gray-900 p-4 rounded-4xl">
        <VMarketItem v-if="selectedMarket" :item="selectedMarket" />

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
import { MarketType, UiDerivativeMarket, UiSpotMarket } from '~/types'

export default Vue.extend({
  components: {
    VMarketItem,
    VSearch,
    'v-dropdown': Dropdown
  },

  props: {
    markets: {
      type: Array as PropType<Array<UiSpotMarket | UiDerivativeMarket>>,
      required: true
    },

    selectedMarket: {
      type: Object as PropType<UiSpotMarket | UiDerivativeMarket>,
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
    filteredMarkets(): Array<UiSpotMarket | UiDerivativeMarket> {
      const { filterMarkets, marketType, markets } = this

      const query = filterMarkets.toLowerCase()

      return markets.filter((market) => {
        const { ticker, quoteDenom } = market
        const satisfiesSearchCondition =
          quoteDenom.toLowerCase().startsWith(query) ||
          ticker.toLowerCase().startsWith(query)
        const marketTypeCondition = marketType
          ? market.subType === marketType
          : true

        return satisfiesSearchCondition && marketTypeCondition
      }) as Array<UiSpotMarket | UiDerivativeMarket>
    }
  },

  methods: {
    handleClick(item: any) {
      // @ts-ignore
      this.$refs.dropdown.onDropdownClose()
      this.$emit('click', item)
    },

    onSelectMarketType(type: MarketType | string) {
      this.marketType = this.marketType === type ? '' : type
    }
  }
})
</script>
