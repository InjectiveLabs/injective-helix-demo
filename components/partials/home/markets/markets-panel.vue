<template>
  <PanelLight>
    <div slot="context">
      <div>
        <div class="flex items-center justify-center my-2 -mx-2">
          <VButton
            :class="{ 'opacity-30': filterType !== MarketFilterType.Volume }"
            text-helix-gray
            class="font-normal rounded"
            @click.stop="updateFilterType(MarketFilterType.Volume)"
          >
            <span class="text-xl">{{ $t('home.trending') }}</span>
          </VButton>
          <div class="mx-2 w-px h-4 bg-gray-700"></div>
          <VButton
            :class="{
              'opacity-30': filterType !== MarketFilterType.New
            }"
            text-helix-gray
            default
            class="font-normal rounded"
            @click.stop="updateFilterType(MarketFilterType.New)"
          >
            <span class="text-xl">{{ $t('home.newlyAdded') }}</span>
          </VButton>
        </div>
      </div>
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
