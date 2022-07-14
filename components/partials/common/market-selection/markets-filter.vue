<template>
  <div>
    <div class="flex items-center justify-between">
      <div class="flex items-center flex-wrap gap-5">
        <MarketTypeSelector
          :type="MarketType.Favorite"
          :active="activeType === MarketType.Favorite"
          data-cy="markets-favorites-selector"
          @click="handleTypeClick"
        >
          <IconStar class="min-w-4 h-4 w-4" />
        </MarketTypeSelector>

        <MarketTypeSelector
          :type="''"
          :active="activeType === ''"
          data-cy="markets-all-markets-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.all') }}
        </MarketTypeSelector>

        <MarketTypeSelector
          :type="MarketType.Perpetual"
          :active="activeType === MarketType.Perpetual"
          data-cy="markets-perpetual-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.perpetual') }}
        </MarketTypeSelector>

        <MarketTypeSelector
          :type="MarketType.Spot"
          :active="activeType === MarketType.Spot"
          data-cy="markets-spot-selector"
          @click="handleTypeClick"
        >
          {{ $t('trade.spots') }}
        </MarketTypeSelector>
      </div>
    </div>
    <div class="w-full mt-4">
      <VSearch
        dense
        name="search"
        class="w-full"
        data-cy="markets-search-input"
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
import MarketTypeSelector from '~/components/partials/common/market-selection/market-type-selector.vue'
import VSearch from '~/components/inputs/search.vue'

export default Vue.extend({
  components: {
    MarketTypeSelector,
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
