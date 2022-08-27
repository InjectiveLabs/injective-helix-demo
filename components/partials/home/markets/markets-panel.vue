<template>
  <PanelLight>
    <div
      slot="context"
      class="flex items-center justify-center sm:my-2 -mx-2 font-semibold gap-4 sm:gap-6"
    >
      <VButton
        :class="{
          'opacity-30': filterType !== MarketFilterType.Volume
        }"
        text-helix-gray
        class="rounded"
        @click.stop="updateFilterType(MarketFilterType.Volume)"
      >
        <span class="text-xl">{{ $t('home.trending') }}</span>
      </VButton>
      <VButton
        :class="{
          'opacity-30': filterType !== MarketFilterType.New
        }"
        text-helix-gray
        default
        class="rounded"
        @click.stop="updateFilterType(MarketFilterType.New)"
      >
        <span class="text-xl">{{ $t('home.newlyAdded') }}</span>
      </VButton>
    </div>
    <Markets :filter-type="filterType" :limit="10" />
  </PanelLight>
</template>

<script lang="ts">
import Vue from 'vue'
import { MarketFilterType } from '~/types'
import Markets from '~/components/partials/home/markets/markets.vue'

export default Vue.extend({
  components: {
    Markets
  },

  data() {
    return {
      MarketFilterType,
      filterType: MarketFilterType.Volume
    }
  },

  methods: {
    updateFilterType(type: MarketFilterType) {
      this.filterType = type
    }
  }
})
</script>
