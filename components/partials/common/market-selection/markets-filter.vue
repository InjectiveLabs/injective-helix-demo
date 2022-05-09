<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="flex items-center flex-wrap gap-5">
        <v-market-type-selector
          :type="MarketType.Favourite"
          :active="activeType === MarketType.Favourite"
          @click="handleTypeClick"
        >
          <v-icon-star class="min-w-4 h-4 w-4" />
        </v-market-type-selector>

        <v-market-type-selector
          :type="''"
          :active="activeType === ''"
          @click="handleTypeClick"
        >
          {{ $t('trade.all') }}
        </v-market-type-selector>

        <v-market-type-selector
          :type="MarketType.Perpetual"
          :active="activeType === MarketType.Perpetual"
          @click="handleTypeClick"
        >
          {{ $t('trade.perpetual') }}
        </v-market-type-selector>

        <v-market-type-selector
          :type="MarketType.Spot"
          :active="activeType === MarketType.Spot"
          @click="handleTypeClick"
        >
          {{ $t('trade.spots') }}
        </v-market-type-selector>
      </div>
    </div>
    <div class="w-full mt-4">
      <v-search
        dense
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
import { MarketType } from '~/types/enums'
import VMarketTypeSelector from '~/components/partials/common/market-selection/market-type-selector.vue'
import VSearch from '~/components/inputs/search.vue'

export default Vue.extend({
  components: {
    VMarketTypeSelector,
    VSearch
  },

  props: {
    activeType: {
      type: String,
      required: true
    },

    search: {
      required: true,
      type: String
    }
  },

  data() {
    return {
      MarketType
    }
  },

  methods: {
    handleTypeClick(type: string) {
      this.$emit('update:activeType', type)
    },

    handleSearchedEvent(search: string) {
      this.$emit('update:search', search)
    }
  }
})
</script>
