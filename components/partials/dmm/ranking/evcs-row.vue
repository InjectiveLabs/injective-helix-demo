<template>
  <TableRow class="font-serif" :class="{ active: active }" sm dense>
    <span class="md:hidden">
      {{ $t('dmm.ranking.address') }}
    </span>
    <span class="md:col-span-4">
      <div class="flex items-center justify-end md:justify-start">
        <span>
          {{ formattedAddress }}
        </span>
        <div v-if="active" class="flex items-center">
          <v-icon-profile class="text-gray-200 h-4 w-4 ml-3 mr-2" />
          <span>({{ $t('dmm.ranking.you') }})</span>
        </div>
      </div>
    </span>

    <span class="md:hidden">
      {{ $t('dmm.ranking.volume') }}
    </span>

    <span
      class="md:col-span-4 text-right md:text-left"
      :class="{ 'md:ml-1': scrollbar }"
    >
      {{ item.volume }} USD
    </span>

    <span class="md:hidden">
      {{ $t('dmm.ranking.evcs') }}
    </span>

    <span
      class="md:col-span-4 text-right md:text-left"
      :class="{ 'md:ml-1': scrollbar }"
    >
      {{ item.evcs }}
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import { UIEpochMarketEVCSItem } from '~/types'

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
      type: Object as PropType<UIEpochMarketEVCSItem>,
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
