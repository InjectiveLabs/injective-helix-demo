<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.ranking.elcsTitle') }}
    </h3>

    <div class="flex items-center justify-between mt-5">
      <div class="flex items-center">
        <h4 class="text-gray-500 text-xs">
          {{ $t('dmm.ranking.marketRewardFactor') }}
        </h4>
        <v-icon-info-tooltip
          lg
          class="ml-3 mr-4"
          color="text-gray-200"
          :tooltip="$t('dmm.ranking.marketRewardFactorTooltip')"
        />
        <p class="text-gray-200 text-xl">{{ rewardFactor }}</p>
      </div>

      <div>
        <p class="text-gray-500 text-xs">
          {{ $t('dmm.ranking.lastUpdatedTime') }}: 11 /15/2021 08:25:25
        </p>
      </div>
    </div>

    <div class="rounded-2xl mt-4 overflow-y-hidden">
      <TableHeader sm dense>
        <div class="col-span-4 grid grid-cols-4">
          <span>
            {{ $t('dmm.ranking.rank') }}
          </span>

          <span class="col-span-3">
            {{ $t('dmm.ranking.address') }}
          </span>
        </div>

        <div class="col-span-8 grid grid-cols-5">
          <span>{{ $t('dmm.ranking.elcsBuy') }} </span>

          <span>{{ $t('dmm.ranking.elcsSell') }} </span>

          <span>{{ $t('dmm.ranking.elcs') }} </span>

          <span>-</span>

          <div class="grid col-span-1 grid-cols-2">
            <span>-</span>
            <span class="text-right mr-2">-</span>
          </div>
        </div>
      </TableHeader>

      <TableBody class="max-h-60 overflow-y-scroll" dense>
        <VElcsRow
          v-for="(item, index) in 8"
          :key="`rank-elcs-${index}`"
          :active="index === 1"
          :item="elcsMockData"
        />
      </TableBody>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VElcsRow from './elcs-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    VElcsRow
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
      elcsMockData: {
        rank: 1,
        address: 'inj1zevxz8gk07cdzetn99845yg7a2raznsse7pxwa',
        buy: '2.3',
        sell: '2.3',
        elcs: '0.8',
        paramOne: '0.2',
        paramTwo: '0.2',
        paramThree: '3.3'
      }
    }
  },

  methods: {}
})
</script>
