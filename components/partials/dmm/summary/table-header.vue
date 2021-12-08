<template>
  <TableHeader sm dense>
    <span class="col-span-3">
      {{ $t('dmm.summary.address') }}
    </span>

    <div class="col-span-2 flex items-center relative">
      <span>
        {{ $t(isElcs ? 'dmm.summary.elcs' : 'dmm.summary.evcs') }}
      </span>
      <v-icon-info-tooltip
        lg
        class="ml-3"
        color="text-gray-200"
        :tooltip="$t(isElcs ? 'dmm.tooltip.elcs' : 'dmm.tooltip.evcs')"
      />
    </div>

    <div class="col-span-2 flex items-center relative">
      <span> {{ $t(isElcs ? 'dmm.summary.elcs' : 'dmm.summary.evcs') }}% </span>
      <v-icon-info-tooltip
        lg
        class="ml-3"
        color="text-gray-200"
        :tooltip="
          $t(
            isElcs ? 'dmm.tooltip.elcsPercentage' : 'dmm.tooltip.evcsPercentage'
          )
        "
      />
    </div>

    <div class="col-span-5 grid grid-cols-2 gap-2 md:gap-4">
      <span>
        <span v-if="latest">{{ $t('dmm.summary.expected') }}</span>
        <span>{{ $t('dmm.summary.rewardsInj') }}</span>
      </span>

      <span class="md:text-right">
        <span v-if="latest">{{ $t('dmm.summary.expected') }}</span>
        <span>{{ $t('dmm.summary.rewardsUsd') }}</span>
      </span>
    </div>
  </TableHeader>
</template>

<script lang="ts">
import Vue from 'vue'
import TableHeader from '~/components/elements/table-header.vue'

export default Vue.extend({
  components: {
    TableHeader
  },

  props: {
    isElcs: {
      type: Boolean,
      default: false
    },

    latest: {
      type: Boolean,
      default: false
    }
  }
})
</script>
