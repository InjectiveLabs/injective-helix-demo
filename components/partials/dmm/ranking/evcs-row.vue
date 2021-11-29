<template>
  <TableRow class="font-serif" :class="{ active: active }" sm dense>
    <div
      class="col-span-2 md:col-span-7 grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-0"
    >
      <span class="md:hidden">
        {{ $t('dmm.ranking.rank') }}
      </span>
      <span class="text-right md:text-left">
        {{ item.rank }}
      </span>

      <span class="md:hidden">
        {{ $t('dmm.ranking.Subaccount') }}
      </span>
      <span class="md:col-span-3">
        <div class="flex items-center justify-end md:justify-start">
          <span>{{ formattedAddress }}</span>
          <div v-if="active" class="flex items-center">
            <v-icon-profile class="text-gray-200 h-4 w-4 ml-3 mr-2" />
            <span>({{ $t('dmm.ranking.you') }})</span>
          </div>
        </div>
      </span>

      <span class="md:hidden">
        {{ $t('dmm.ranking.elcs') }}
      </span>
      <span
        class="md:col-span-2 text-right md:text-left"
        :class="{ 'md:ml-1': scrollbar }"
      >
        {{ item.elcs }}
      </span>
    </div>

    <div class="col-span-2 md:col-span-5 grid grid-cols-2 gap-2 md:gap-0">
      <span class="md:hidden">-</span>
      <span class="text-right md:text-left" :class="{ 'md:ml-1': scrollbar }">
        {{ item.paramOne }}
      </span>

      <div
        class="col-span-2 md:col-span-1 grid grid-cols-2 md:flex justify-between gap-2 md:gap-0"
      >
        <span class="md:hidden">-</span>
        <span class="text-right md:text-left" :class="{ 'md:ml-1': scrollbar }">
          {{ item.paramTwo }}
        </span>
        <span class="md:hidden">-</span>
        <span class="text-right md:text-left" :class="{ 'md:ml-1': scrollbar }">
          {{ item.paramThree }}
        </span>
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
    },

    scrollbar: {
      type: Boolean,
      default: false
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
