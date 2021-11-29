<template>
  <TableRow class="font-serif" sm dense>
    <span class="col-span-2 md:col-span-1">
      <span class="md:hidden">#</span>
      {{ item.number }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.history.timestamp') }}
    </span>
    <span class="md:col-span-4 text-right md:text-left">
      {{ item.timestamp }}
    </span>

    <div
      class="col-span-2 md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4"
    >
      <span class="md:hidden">
        {{ $t('dmm.history.elcs') }}
      </span>
      <span class="text-right md:text-left" :class="{ 'md:ml-2': scrollbar }">
        {{ item.elcs }}
      </span>

      <span class="md:hidden"> {{ $t('dmm.history.elcs') }} % </span>
      <span class="text-right md:text-left" :class="{ 'md:ml-2': scrollbar }">
        {{ item.elcsPercentage }}%
      </span>

      <span class="md:hidden">
        {{ $t('dmm.history.evcs') }}
      </span>
      <span class="text-right md:text-left" :class="{ 'md:ml-2': scrollbar }">
        {{ item.evcs }}
      </span>

      <span class="md:hidden"> {{ $t('dmm.history.evcs') }} % </span>
      <span class="text-right"> {{ item.evcsPercentage }}% </span>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TableRow from '~/components/elements/table-row.vue'
import { DmmHistory } from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    active: {
      type: Boolean,
      default: false
    },

    item: {
      type: Object as PropType<DmmHistory>,
      required: true
    },

    scrollbar: {
      type: Boolean,
      default: false
    }
  }
})
</script>
