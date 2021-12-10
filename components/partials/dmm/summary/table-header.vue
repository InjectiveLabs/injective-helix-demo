<template>
  <TableHeader sm dense>
    <span class="col-span-4">
      {{ $t('dmm.summary.address') }}
    </span>

    <div class="col-span-8 grid grid-cols-10 gap-2 md:gap-0">
      <div class="flex items-center relative col-span-2">
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

      <div class="flex items-center relative col-span-2">
        <span>
          {{ $t(isElcs ? 'dmm.summary.elcs' : 'dmm.summary.evcs') }} %
        </span>
        <v-icon-info-tooltip
          lg
          class="ml-3"
          color="text-gray-200"
          :tooltip="
            $t(
              isElcs
                ? 'dmm.tooltip.elcsPercentage'
                : 'dmm.tooltip.evcsPercentage'
            )
          "
        />
      </div>

      <span class="col-span-3">
        <span v-if="latest">{{ $t('dmm.summary.expected') }}</span>
        <span>{{ $t('dmm.summary.rewardsInj') }}</span>
      </span>

      <span class="md:text-right col-span-3">
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
