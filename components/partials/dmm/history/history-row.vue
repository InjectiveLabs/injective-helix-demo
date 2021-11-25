<template>
  <TableRow class="font-serif" sm dense>
    <span>{{ item.number }}</span>

    <span class="col-span-5">
      {{ item.timestamp }}
    </span>

    <span class="col-span-3 ml-2">
      {{ item.score }}
    </span>

    <span class="col-span-3 text-right">{{ item.scorePercentage }}%</span>
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
    }
  }
})
</script>
