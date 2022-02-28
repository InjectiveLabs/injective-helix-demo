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
          <span>{{ $t('trade.all') }}</span>
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
          <span>{{ $t('trade.perpetual') }}</span>
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
          <span>{{ $t('trade.spots') }}</span>
        </v-button>
        <template v-if="false">
          <div class="mx-2 w-px h-4 bg-gray-700"></div>
          <v-button
            :class="{
              'text-gray-500': marketBase !== MarketBase.Terra
            }"
            text-sm
            class="font-normal"
            @click.stop="onSelectMarketBase(MarketBase.Terra)"
          >
            <span>{{ $t('terra') }}</span>
          </v-button>
        </template>
        <div class="hidden md:block mx-2 w-px h-4 bg-gray-700"></div>
        <v-button
          :class="{
            'text-gray-500': marketType !== MarketType.Futures
          }"
          text-sm
          class="hidden md:block font-normal opacity-50"
          @click.stop="() => {}"
        >
          <span>{{ $t('trade.futures') }}</span>
        </v-button>
      </div>
    </div>
    <div class="w-full mt-2">
      <v-search
        name="search"
        class="w-full"
        :placeholder="$t('trade.filter_markets')"
        :search="search"
        @searched="handleSearchedEvent"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MarketBase, MarketType } from '@injectivelabs/ui-common'
import VSearch from '~/components/inputs/search.vue'

export default Vue.extend({
  components: {
    VSearch
  },

  props: {
    search: {
      required: true,
      type: String
    },

    marketBase: {
      required: true,
      type: String
    },

    marketType: {
      required: true,
      type: String
    }
  },

  data() {
    return {
      MarketBase,
      MarketType
    }
  },

  methods: {
    onSelectMarketType(type: MarketType | string) {
      this.$emit('update:market-type', this.marketType === type ? '' : type)
    },

    onSelectMarketBase(type: MarketBase | string) {
      this.$emit('update:market-base', this.marketType === type ? '' : type)
    },

    handleSearchedEvent(search: string) {
      this.$emit('update:search', search)
    }
  }
})
</script>
