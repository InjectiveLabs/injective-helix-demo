<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.summary.elcsTitle') }}
    </h3>

    <div class="flex items-center sm:items-end mt-4 flex-wrap">
      <h4 class="text-gray-500 text-xs uppercase">
        {{ $t('dmm.summary.elcsTotalTokens') }}
      </h4>
      <p class="text-gray-200 text-xl mx-4 leading-5.5">{{ totalTokens }}</p>

      <p class="text-gray-500 text-xs mt-2 sm:mt-0">
        {{ $t('dmm.summary.elcsTotalTokensPercentage', { percentage: '50' }) }}
      </p>
    </div>

    <div class="rounded-2xl mt-4 overflow-y-hidden">
      <TableHeader sm dense>
        <span class="col-span-4">
          {{ $t('dmm.summary.address') }}
        </span>

        <div class="col-span-3 flex items-center relative">
          <span>{{ $t('dmm.summary.elcsTotal') }}%</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.summary.elcsTotalPercentageTooltip')"
          />
        </div>

        <div class="col-span-5 grid grid-cols-2 gap-2 md:gap-4">
          <div class="flex items-center relative">
            <span>
              {{ $t('dmm.summary.rewardsInj') }}
            </span>
            <v-icon-info-tooltip
              lg
              class="ml-3 min-w-4 min-h-4"
              color="text-gray-200"
              :tooltip="$t('dmm.summary.rewardsInjTooltip')"
            />
          </div>

          <div class="flex items-center relative justify-end">
            <span>
              {{ $t('dmm.summary.rewardsUsd') }}
            </span>
            <v-icon-info-tooltip
              lg
              class="ml-3 min-w-4 min-h-4"
              color="text-gray-200"
              :tooltip="$t('dmm.summary.rewardsUsdTooltip')"
            />
          </div>
        </div>
      </TableHeader>

      <TableBody
        class="max-h-60 overflow-y-scroll"
        :class="[rows > 5 ? 'md:overflow-y-scroll' : 'md:overflow-y-hidden']"
        dense
      >
        <VElcsRow
          v-for="(item, index) in rows"
          :key="`summary-elcs-${index}`"
          :active="index === 2"
          :item="elcsMockData"
          :scrollbar="rows > 5"
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
      totalTokens: '255,252',
      rows: 10,
      elcsMockData: {
        address: 'inj1zevxz8gk07cdzetn99845yg7a2raznsse7pxwa',
        total: '0.25',
        totalPercentage: '10.5',
        rewardsInInj: '1525.2',
        rewardsInUsd: '15,263'
      }
    }
  },

  methods: {}
})
</script>
