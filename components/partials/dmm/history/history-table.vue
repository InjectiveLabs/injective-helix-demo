<template>
  <div class="rounded-2xl mt-4 overflow-y-hidden">
    <TableHeader v-if="formattedRecords.length > 0" sm dense>
      <span>#</span>

      <span class="col-span-5">
        {{ $t('dmm.history.timestamp') }}
      </span>

      <div class="col-span-3 flex items-center">
        <span>
          {{ $t('dmm.history.elcs') }}
        </span>
        <v-icon-info-tooltip
          lg
          class="ml-3 min-w-4 min-h-4"
          color="text-gray-200"
          :tooltip="$t('dmm.tooltip.elcs')"
        />
      </div>

      <div class="col-span-3 flex items-center">
        <span>
          {{ $t('dmm.history.evcs') }}
        </span>
        <v-icon-info-tooltip
          lg
          class="ml-3 min-w-4 min-h-4"
          color="text-gray-200"
          :tooltip="$t('dmm.tooltip.evcs')"
        />
      </div>
    </TableHeader>

    <TableBody
      class="max-h-[480px] overflow-y-scroll"
      :class="[
        { 'min-h-[480px]': isEmpty },
        formattedRecords.length > 10
          ? 'md:overflow-y-scroll'
          : 'md:overflow-y-hidden'
      ]"
      :show-empty="formattedRecords.length === 0"
      dense
    >
      <VHistoryRow
        v-for="(item, index) in formattedRecords"
        :key="`dmm-history-${index}`"
        :item="item"
        :scrollbar="formattedRecords.length > 10"
      />

      <template slot="empty">
        <div class="col-span-12 text-center py-6">
          <p class="text-xl text-gray-200 font-bold">
            {{ $t('dmm.history.emptyTitle') }}
          </p>
          <a
            href="https://injective.typeform.com/to/VcgtcivA"
            target="_blank"
            class="min-w-[210px] mt-6 text-center rounded-3xl px-6 py-2.5 text-base leading-5 max-h-10 bg-primary-500 hover:bg-primary-400 text-gray-800 inline-block"
          >
            <span class="font-bold">{{ $t('dmm.history.contactNow') }}</span>
          </a>
        </div>
      </template>
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { EpochResultRecord } from '@injectivelabs/exchange-consumer'
import { BigNumberInBase } from '@injectivelabs/utils'
import VHistoryRow from './history-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'
import { UIEpochRecordItem } from '~/types'
import { UI_DEFAULT_DMM_DECIMALS } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    TableHeader,
    TableBody,
    VHistoryRow
  },

  props: {
    active: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      isEmpty: false
    }
  },

  computed: {
    records(): EpochResultRecord[] {
      return this.$accessor.dmm.records
    },

    formattedRecords(): UIEpochRecordItem[] {
      const { records } = this

      return records.map(({ createdAt, lcs, vcs }, index) => {
        const dmmName = lcs ? Object.keys(lcs.summaryMap)[0] : null
        const elcs = dmmName && lcs ? lcs.summaryMap[dmmName].lcs : '0'
        const evcs = dmmName && vcs ? vcs.summaryMap[dmmName].vcs : '0'

        return {
          number: Number(index) + 1,
          elcs: new BigNumberInBase(elcs).toFormat(UI_DEFAULT_DMM_DECIMALS),
          evcs: new BigNumberInBase(evcs).toFormat(UI_DEFAULT_DMM_DECIMALS),
          createdAt
        }
      })
    }
  },

  methods: {}
})
</script>
