<template>
  <div class="rounded-2xl mt-4 overflow-y-hidden">
    <TableHeader sm dense>
      <span>#</span>

      <span class="col-span-5">
        {{ $t('dmm.history.timestamp') }}
      </span>

      <div class="col-span-3 flex items-center">
        <span>
          {{ $t('dmm.history.marketMakerScore') }}
        </span>
        <v-icon-info-tooltip
          lg
          class="ml-3"
          color="text-gray-200"
          :tooltip="$t('dmm.history.marketMakerScoreTooltip')"
        />
      </div>

      <div class="col-span-3 flex items-center justify-end">
        <span> {{ $t('dmm.history.marketMakerScore') }}% </span>
        <v-icon-info-tooltip
          lg
          class="ml-3"
          color="text-gray-200"
          :tooltip="$t('dmm.history.marketMakerScorePercentageTooltip')"
        />
      </div>
    </TableHeader>

    <TableBody
      v-if="isUserWalletConnected"
      class="min-h-[480px] max-h-[480px] overflow-y-scroll"
      :show-empty="isEmpty"
      dense
    >
      <div v-if="!isEmpty">
        <VHistoryRow
          v-for="(item, index) in 15"
          :key="`dmm-history-${index}`"
          :active="index === 1"
          :item="historyMockData"
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
      historyMockData: {
        number: 1,
        timestamp: 'Oct 25th 2021 05:25:00 UTC',
        score: '2.3',
        scorePercentage: '25.3'
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
