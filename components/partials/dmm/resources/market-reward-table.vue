<template>
  <div class="rounded-2xl mt-4 overflow-y-hidden">
    <TableHeader sm dense>
      <span class="col-span-4">
        {{ $t('dmm.resource.markets') }}
      </span>
      <div class="col-span-4 flex items-center relative">
        <span>
          {{ $t('dmm.resource.elcs') }}
        </span>
      </div>

      <div class="col-span-4 flex items-center relative">
        <span>
          {{ $t('dmm.resource.evcs') }}
        </span>
      </div>
    </TableHeader>

    <TableBody
      class="max-h-60 overflow-y-scroll"
      :class="[
        markets.length > 5 ? 'md:overflow-y-scroll' : 'md:overflow-y-hidden'
      ]"
      dense
    >
      <VMarketRewardRow
        v-for="(item, index) in markets"
        :key="`market-reward-${index}`"
        :item="item"
        :scrollbar="markets.length > 5"
      />
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VMarketRewardRow from './market-reward-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import { UiEpochMarketsWithTokenMeta } from '~/types'

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

  computed: {
    markets(): UiEpochMarketsWithTokenMeta[] {
      return this.$accessor.dmm.marketsWithTokenMeta
    }
  }
})
</script>
