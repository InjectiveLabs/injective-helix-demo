<template>
  <TableRow class="font-serif" :class="{ active: active }" sm dense>
    <div class="col-span-4 grid grid-cols-4">
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
    </div>

    <div class="col-span-8 grid grid-cols-5">
      <span class="ml-1">{{ item.buy }} </span>

      <span class="ml-2">{{ item.sell }} </span>

      <span class="ml-2">{{ item.elcs }} </span>

      <span class="ml-2">{{ item.paramOne }} </span>

      <div class="grid col-span-1 grid-cols-2">
        <span class="ml-2">{{ item.paramTwo }} </span>

        <span class="text-right">{{ item.paramThree }} </span>
      </div>
    </div>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import { RankingElcs } from '~/types'

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
      type: Object as PropType<RankingElcs>,
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
