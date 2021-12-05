<template>
  <TableRow class="font-serif" sm dense>
    <span class="md:hidden">
      {{ $t('dmm.resource.markets') }}
    </span>
    <span class="md:col-span-4 text-right md:text-left">
      {{ item.ticker }}
    </span>
    <span class="md:hidden">
      {{ $t('dmm.resource.elcs') }}
    </span>
    <span
      class="md:col-span-4 text-right md:text-left"
      :class="{ 'md:ml-1': scrollbar }"
    >
      {{ item.lcsAdjustFactor }}
    </span>
    <span class="md:hidden">
      {{ $t('dmm.resource.evcs') }}
    </span>
    <span
      class="md:col-span-4 text-right md:text-left"
      :class="{ 'md:ml-2': scrollbar }"
    >
      {{ item.vcsAdjustFactor }}
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TableRow from '~/components/elements/table-row.vue'
import { UiEpochMarketsWithTokenMeta } from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    item: {
      type: Object as PropType<UiEpochMarketsWithTokenMeta>,
      required: true
    },

    scrollbar: {
      type: Boolean,
      default: false
    }
  }
})
</script>
