<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-200">
      {{ $t('dmm.summary.evcsTitle') }}
    </h3>

    <div class="flex items-end mt-4">
      <h4 class="text-gray-500 text-xs uppercase">
        {{ $t('dmm.summary.evcsTotalTokens') }}
      </h4>
      <p class="text-gray-200 text-xl mx-4 leading-5.5">{{ totalTokens }}</p>

      <p class="text-gray-500 text-xs">
        {{ $t('dmm.summary.evcsTotalTokensPercentage', { percentage: '50' }) }}
      </p>
    </div>

    <div class="rounded-2xl mt-4 overflow-y-hidden">
      <TableHeader sm dense>
        <span class="col-span-3">
          {{ $t('dmm.summary.address') }}
        </span>

        <div class="col-span-2 flex items-center relative">
          <span>
            {{ $t('dmm.summary.total') }}
          </span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.summary.totalTooltip')"
          />
        </div>

        <div class="col-span-2 flex items-center relative">
          <span>{{ $t('dmm.summary.total') }}%</span>
          <v-icon-info-tooltip
            lg
            class="ml-3"
            color="text-gray-200"
            :tooltip="$t('dmm.summary.totalPercentageTooltip')"
          />
        </div>

        <div class="col-span-5 grid grid-cols-2">
          <div class="flex items-center relative">
            <span>
              {{ $t('dmm.summary.rewardsInj') }}
            </span>
            <v-icon-info-tooltip
              lg
              class="ml-3"
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
              class="ml-3"
              color="text-gray-200"
              :tooltip="$t('dmm.summary.rewardsUsdTooltip')"
            />
          </div>
        </div>
      </TableHeader>

      <TableBody class="max-h-60 overflow-y-scroll" dense>
        <VEvcsRow
          v-for="(item, index) in 8"
          :key="`sumamry-evcs-${index}`"
          :item="evcsMockData"
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
      totalTokens: '255,252',
      evcsMockData: {
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
