<template>
  <TableRow class="font-serif col-span-12" :class="{ active: active }" sm dense>
    <span class="md:hidden">
      {{ $t('dmm.summary.address') }}
    </span>

    <span class="md:col-span-4 text-right md:text-left">
      <div class="flex items-center md:justify-start justify-end">
        <span>
          {{ formattedAddress }}
        </span>
        <div v-if="active" class="flex items-center">
          <v-icon-profile class="text-gray-200 h-4 w-4 ml-3 mr-2" />
          <span>({{ $t('dmm.ranking.you') }})</span>
        </div>
      </div>
    </span>

    <div
      class="col-span-2 md:col-span-8 grid grid-cols-2 md:grid-cols-10 gap-2 md:gap-0"
    >
      <span class="md:hidden">
        {{ $t(isElcs ? 'dmm.summary.elcs' : 'dmm.summary.evcs') }}
      </span>
      <span
        class="md:col-span-2 text-right md:text-left"
        :class="{ 'md:ml-2': scrollbar }"
      >
        {{ item.total }}
      </span>

      <span class="md:hidden">
        {{ $t(isElcs ? 'dmm.summary.elcs' : 'dmm.summary.evcs') }} %
      </span>
      <span
        class="md:col-span-2 text-right md:text-left"
        :class="{ 'md:ml-2': scrollbar }"
      >
        {{ item.totalPercentage }} %
      </span>

      <span class="md:hidden">
        {{ $t('dmm.summary.rewardsInj') }}
      </span>
      <span
        class="md:col-span-3 text-right md:text-left"
        :class="{ 'md:ml-2': scrollbar }"
      >
        {{ item.rewardInInj }} INJ
      </span>

      <span class="md:hidden">
        {{ $t('dmm.summary.rewardsUsd') }}
      </span>
      <span class="md:col-span-3 text-right">
        <span>≈</span>
        <span>${{ item.rewardInUsd }}</span>
      </span>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import { UiEpochSummaryItem } from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },

    isElcs: {
      type: Boolean,
      default: false
    },

    item: {
      type: Object as PropType<UiEpochSummaryItem>,
      required: true
    },

    scrollbar: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    formattedAddress(): string {
      const { item } = this

      if (!item.address) {
        return ''
      }

      return formatWalletAddress(item.address)
    }
  }
})
</script>
