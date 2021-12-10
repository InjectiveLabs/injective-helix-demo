<template>
  <div>
    <div class="flex justify-between items-end flex-wrap">
      <h3 class="text-xl font-bold text-gray-200">
        {{ $t('dmm.summary.title') }}
      </h3>
      <span class="text-sm text-gray-500">
        {{ $t('dmm.common.lastUpdatedTime') }}: {{ lastUpdated }}
      </span>
    </div>
    <v-card class="mt-6">
      <div class="p-2">
        <!-- hide for V1 -->
        <VEpochProgressBar v-if="false" />
        <VElcsTable
          :total-inj="elcsInjAmount"
          :ratio="elcsRatio"
          class="mt-6"
        />
        <VEvcsTable
          :total-inj="evcsInjAmount"
          :ratio="evcsRatio"
          class="mt-6"
        />
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { format } from 'date-fns'
import VElcsTable from './elcs-table.vue'
import VEvcsTable from './evcs-table.vue'
import VEpochProgressBar from '~/components/partials/dmm/common/epoch-progress-bar.vue'
import { UiEpochMeta } from '~/types'
import { DMM_TIME_STAMP_FORMAT, ZERO_IN_BASE } from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VEpochProgressBar,
    VElcsTable,
    VEvcsTable
  },

  computed: {
    epochLastUpdated(): string {
      return this.$accessor.dmm.updatedAt
    },

    epochMeta(): UiEpochMeta {
      return this.$accessor.dmm.meta
    },

    lastUpdated(): string {
      const { epochLastUpdated } = this

      return format(new Date(epochLastUpdated), DMM_TIME_STAMP_FORMAT)
    },

    elcsInjAmount(): BigNumberInBase {
      const { epochMeta } = this

      const amount = new BigNumberInBase(epochMeta.rewardInjNum).times(
        new BigNumberInBase(epochMeta.lcsRewardFraction)
      )

      if (amount.gt(0)) {
        return amount
      }

      return ZERO_IN_BASE
    },

    evcsInjAmount(): BigNumberInBase {
      const { epochMeta } = this

      const amount = new BigNumberInBase(epochMeta.rewardInjNum).times(
        new BigNumberInBase(epochMeta.vcsRewardFraction)
      )

      if (amount.gt(0)) {
        return amount
      }

      return ZERO_IN_BASE
    },

    elcsRatio(): string {
      const { epochMeta } = this

      if (epochMeta && epochMeta.lcsRewardFraction) {
        return epochMeta.lcsRewardFraction
      }

      return '0'
    },

    evcsRatio(): string {
      const { epochMeta } = this

      if (epochMeta && epochMeta.vcsRewardFraction) {
        return epochMeta.vcsRewardFraction
      }

      return '0'
    }
  }
})
</script>
