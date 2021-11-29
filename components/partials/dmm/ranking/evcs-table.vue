<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.ranking.evcsTitle') }}
    </h3>

    <div class="flex items-center justify-between mt-5 flex-wrap">
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
        <div class="col-span-7 grid grid-cols-6">
          <span>
            {{ $t('dmm.ranking.rank') }}
          </span>

          <span class="col-span-3">
            {{ $t('dmm.ranking.Subaccount') }}
          </span>

          <span class="col-span-2">{{ $t('dmm.ranking.elcs') }}</span>
        </div>

        <div class="col-span-5 grid grid-cols-2">
          <span>-</span>

          <div class="grid-cols-2 flex justify-between">
            <span>-</span>
            <span class="text-right mr-2">-</span>
          </div>
        </div>
      </TableHeader>

      <TableBody
        class="max-h-60 overflow-y-scroll"
        :class="[rows > 5 ? 'md:overflow-y-scroll' : 'md:overflow-y-hidden']"
        dense
      >
        <VEvcsRow
          v-for="(item, index) in rows"
          :key="`rank-evcs-${index}`"
          :active="index === 1"
          :item="evcsMockData"
          :scrollbar="rows > 5"
        />
      </TableBody>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VEvcsRow from './evcs-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    VEvcsRow
  },

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      rows: 4,
      rewardFactor: '1.5',
      evcsMockData: {
        rank: 1,
        subaccount: 'inj1zevxz8gk07cdzetn99845yg7a2raznsse7pxwa',
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
