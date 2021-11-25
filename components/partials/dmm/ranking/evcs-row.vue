<template>
  <TableRow class="font-serif" :class="{ active: active }" sm dense>
    <div class="col-span-7 grid grid-cols-6">
      <span class="text-left">
        {{ item.rank }}
      </span>

      <span class="col-span-3">
        <div class="flex items-center">
          <span>{{ formattedAddress }}</span>
          <div v-if="active" class="flex items-center">
            <v-icon-profile class="text-gray-200 h-5 w-5 ml-3 mr-2" />
            <span>({{ $t('dmm.ranking.you') }})</span>
          </div>
        </div>
      </span>

      <span class="col-span-2">{{ item.elcs }} </span>
    </div>

    <div class="col-span-5 grid grid-cols-2">
      <span>{{ item.paramOne }} </span>

      <div class="grid-cols-2 flex justify-between">
        <span>{{ item.paramTwo }} </span>
        <span>{{ item.paramThree }} </span>
      </div>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import { RankingEvcs } from '~/types'

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
      type: Object as PropType<RankingEvcs>,
      required: true
    }
  },

  computed: {
    formattedAddress(): string {
      const { item } = this

      if (!item.subaccount) {
        return ''
      }

      return formatWalletAddress(item.subaccount)
    }
  }
})
</script>
