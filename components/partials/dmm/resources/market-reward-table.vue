<template>
  <div class="rounded-2xl mt-4 overflow-y-hidden">
    <TableHeader sm dense>
      <span class="col-span-4">
        {{ $t('dmm.resource.markets') }}
      </span>
      <span class="col-span-4">
        {{ $t('dmm.resource.elcs') }}
      </span>
      <span class="col-span-4">
        {{ $t('dmm.resource.evcs') }}
      </span>
    </TableHeader>

    <TableBody class="max-h-60 overflow-y-scroll" dense>
      <VMarketRewardRow
        v-for="(item, index) in 8"
        :key="`market-reward-${index}`"
        :item="marketRewardMockData"
      />
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VMarketRewardRow from './market-reward-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    VMarketRewardRow
  },

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      rewardFactor: '1.5',
      marketRewardMockData: {
        market: 'INJ/USDT Spot',
        elcs: '1.5',
        evcs: '1.5'
      }
    }
  },

  methods: {}
})
</script>
