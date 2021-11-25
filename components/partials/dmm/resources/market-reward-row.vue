<template>
  <TableRow class="font-serif" sm dense>
    <span class="col-span-4">
      {{ item.market }}
    </span>
    <span class="col-span-4 ml-1">
      {{ item.elcs }}
    </span>
    <span class="col-span-4 ml-2">
      {{ item.evcs }}
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import TableRow from '~/components/elements/table-row.vue'
import { MarketRewardFactor } from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    item: {
      type: Object as PropType<MarketRewardFactor>,
      required: true
    }
  }
})
</script>
