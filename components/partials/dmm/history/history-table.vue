<template>
  <div class="rounded-2xl mt-4 overflow-y-hidden">
    <TableHeader sm dense>
      <span>#</span>

      <span class="col-span-4">
        {{ $t('dmm.history.timestamp') }}
      </span>

      <div class="col-span-7 flex items-center grid grid-cols-4 gap-2 md:gap-4">
        <div class="flex items-center">
          <span>
            {{ $t('dmm.history.elcs') }}
          </span>
          <v-icon-info-tooltip
            lg
            class="ml-3 min-w-4 min-h-4"
            color="text-gray-200"
            :tooltip="$t('dmm.history.elcsTooltip')"
          />
        </div>

        <div class="flex items-center">
          <span> {{ $t('dmm.history.elcs') }} % </span>
          <v-icon-info-tooltip
            lg
            class="ml-3 min-w-4 min-h-4"
            color="text-gray-200"
            :tooltip="$t('dmm.history.elcsTooltip')"
          />
        </div>

        <div class="flex items-center">
          <span>
            {{ $t('dmm.history.evcs') }}
          </span>
          <v-icon-info-tooltip
            lg
            class="ml-3 min-w-4 min-h-4"
            color="text-gray-200"
            :tooltip="$t('dmm.history.evcsTooltip')"
          />
        </div>

        <div class="flex items-center justify-end">
          <span> {{ $t('dmm.history.evcs') }} % </span>
          <v-icon-info-tooltip
            lg
            class="ml-3 min-w-4 min-h-4"
            color="text-gray-200"
            :tooltip="$t('dmm.history.evcsPercentageTooltip')"
          />
        </div>
      </div>
    </TableHeader>

    <TableBody
      v-if="isUserWalletConnected"
      class="max-h-[480px] overflow-y-scroll"
      :class="[
        { 'min-h-[480px]': isEmpty },
        rows > 10 ? 'md:overflow-y-scroll' : 'md:overflow-y-hidden'
      ]"
      :show-empty="isEmpty"
      dense
    >
      <div v-if="!isEmpty">
        <VHistoryRow
          v-for="(item, index) in rows"
          :key="`dmm-history-${index}`"
          :active="index === 1"
          :item="historyMockData"
          :scrollbar="rows > 10"
        />
      </div>
      <template slot="empty">
        <div class="col-span-12 text-center">
          <p class="text-xl text-gray-200 font-bold">
            {{ $t('dmm.history.emptyTitle') }}
          </p>
          <v-button lg primary class="min-w-[210px] mt-6">
            <span class="font-bold">{{ $t('dmm.history.contactNow') }}</span>
          </v-button>
        </div>
      </template>
    </TableBody>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import VHistoryRow from './history-row.vue'
import TableHeader from '~/components/elements/table-header.vue'
import TableBody from '~/components/elements/table-body.vue'

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
      isEmpty: false,
      rows: 15,
      historyMockData: {
        number: 1,
        timestamp: 'Oct 25th 2021 05:25:00 UTC',
        elcs: '2.3',
        elcsPercentage: '25.3',
        evcs: '1.8',
        evcsPercentage: '18.4'
      }
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    }
  },

  methods: {}
})
</script>
