<template>
  <TableRow class="font-serif" :class="{ active: active }" sm dense>
    <span class="md:hidden">
      {{ $t('dmm.ranking.address') }}
    </span>
    <div class="flex items-center md:col-span-4 justify-end md:justify-start">
      <span>
        {{ formattedAddress }}
      </span>
      <div v-if="active" class="flex items-center">
        <v-icon-profile class="text-gray-200 h-4 w-4 ml-3 mr-2" />
        <span>({{ $t('dmm.ranking.you') }})</span>
      </div>
    </div>

    <span class="md:hidden">{{ $t('dmm.ranking.elcsBuy') }}</span>
    <span
      :class="{ 'md:ml-1': scrollbar }"
      class="text-right md:col-span-3 md:text-left"
    >
      {{ item.buy }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.ranking.elcsSell') }}
    </span>

    <span
      :class="{ 'md:ml-2': scrollbar }"
      class="text-right md:col-span-3 md:text-left"
    >
      {{ item.sell }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.ranking.elcs') }}
    </span>
    <span
      :class="{ 'md:ml-2': scrollbar }"
      class="text-right md:col-span-2 md:text-left"
    >
      {{ item.elcs }}
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatWalletAddress } from '@injectivelabs/utils'
import TableRow from '~/components/elements/table-row.vue'
import { UIEpochMarketELCSItem } from '~/types'
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
      type: Object as PropType<UIEpochMarketELCSItem>,
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
