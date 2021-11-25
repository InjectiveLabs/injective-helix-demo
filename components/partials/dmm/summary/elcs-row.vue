<template>
  <TableRow class="font-serif" sm dense>
    <span class="col-span-3">
      {{ formattedAddress }}
    </span>

    <span class="col-span-2 ml-1">
      {{ item.total }}
    </span>

    <span class="col-span-2 ml-2"> {{ item.totalPercentage }}% </span>

    <div class="col-span-5 grid grid-cols-2">
      <span class="ml-2"> {{ item.rewardsInInj }} INJ </span>

      <span class="text-right"> ${{ item.rewardsInUsd }} </span>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import { SummaryElcs } from '~/types'

export default Vue.extend({
  components: {
    TableRow
  },

  props: {
    item: {
      type: Object as PropType<SummaryElcs>,
      required: true
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
