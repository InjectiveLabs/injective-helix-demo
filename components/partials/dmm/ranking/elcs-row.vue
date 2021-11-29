<template>
  <TableRow class="font-serif" :class="{ active: active }" sm dense>
    <span class="md:hidden">
      {{ $t('dmm.ranking.rank') }}
    </span>
    <span class="text-right md:text-left">
      {{ item.rank }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.ranking.address') }}
    </span>
    <div class="flex items-center md:col-span-3 justify-end md:justify-start">
      <span>{{ formattedAddress }}</span>
      <div v-if="active" class="flex items-center">
        <v-icon-profile class="text-gray-200 h-4 w-4 ml-3 mr-2" />
        <span>({{ $t('dmm.ranking.you') }})</span>
      </div>
    </div>

    <div
      class="col-span-2 md:col-span-8 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-0"
    >
      <span class="md:hidden">{{ $t('dmm.ranking.elcsBuy') }}</span>
      <span :class="{ 'md:ml-1': scrollbar }" class="text-right md:text-left">
        {{ item.buy }}
      </span>

      <span class="md:hidden">
        {{ $t('dmm.ranking.elcsSell') }}
      </span>

      <span :class="{ 'md:ml-2': scrollbar }" class="text-right md:text-left">
        {{ item.sell }}
      </span>

      <span class="md:hidden">
        {{ $t('dmm.ranking.elcs') }}
      </span>
      <span :class="{ 'md:ml-2': scrollbar }" class="text-right md:text-left">
        {{ item.elcs }}
      </span>

      <span class="md:hidden"> - </span>
      <span :class="{ 'md:ml-2': scrollbar }" class="text-right md:text-left">
        {{ item.paramOne }}
      </span>

      <div class="grid col-span-2 md:col-span-1 grid-cols-2 gap-2 md:gap-0">
        <span class="md:hidden"> - </span>
        <span :class="{ 'md:ml-2': scrollbar }" class="text-right md:text-left">
          {{ item.paramTwo }}
        </span>

        <span class="md:hidden"> - </span>
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
