<template>
  <TableRow class="font-serif" sm dense>
    <span class="col-span-2 md:col-span-1">
      <span class="md:hidden">#</span>
      {{ item.number }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.history.timestamp') }}
    </span>
    <span class="md:col-span-5 text-right md:text-left">
      {{ timestamp }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.history.elcs') }}
    </span>
    <span
      class="md:col-span-3 text-right md:text-left"
      :class="{ 'md:ml-2': scrollbar }"
    >
      {{ item.elcs }}
    </span>

    <span class="md:hidden">
      {{ $t('dmm.history.evcs') }}
    </span>
    <span
      class="md:col-span-3 text-right md:text-left"
      :class="{ 'md:ml-2': scrollbar }"
    >
      {{ item.evcs }}
    </span>
  </TableRow>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { format } from 'date-fns'
import TableRow from '~/components/elements/table-row.vue'
import { UIEpochRecordItem } from '~/types'
import { DMM_TIME_STAMP_FORMAT } from '~/app/utils/constants'

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
      type: Object as PropType<UIEpochRecordItem>,
      required: true
    },

    scrollbar: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    timestamp(): string {
      const { item } = this

      if (item.createdAt) {
        return format(new Date(item.createdAt), DMM_TIME_STAMP_FORMAT)
      }

      return ''
    }
  }
})
</script>
