<template>
  <div class="bg-gray-900 p-4 rounded-lg">
    <h4 class="text-gray-500 text-xs uppercase">
      {{ $t('dmm.summary.tokensDistributionTitle') }}
    </h4>
    <div class="relative overflow-x-hidden h-4 my-3">
      <div
        v-for="epoch in formattedEpochs"
        :key="`${epoch.id}-progress`"
        class="h-4 cursor-pointer absolute w-full"
        :class="[epoch.id === active ? 'bg-primary-500' : 'bg-primary-700']"
        :style="{
          left: `${epoch.position}%`,
          width: `${epoch.percentageToFormat}%`
        }"
      />
      <div
        v-tooltip="{ content: $t('dmm.epoch.upcomingEpoch') }"
        class="h-4 cursor-pointer absolute bg-gray-400 w-full"
        :style="{
          width: `calc(100 - ${totalPastEpochPercentage})%`,
          left: `${totalPastEpochPercentage}%`
        }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UiEpochDate } from '~/types'
import { UI_DEFAULT_DMM_DECIMALS, ZERO_IN_BASE } from '~/app/utils/constants'
export default Vue.extend({
  props: {},

  data() {
    return {
      active: 'epoch_211130_211227-2',
      maxEpochReward: new BigNumberInBase(3000000)
    }
  },

  computed: {
    activeEpochId(): string {
      return this.$accessor.dmm.activeEpochId
    },

    epochs(): UiEpochDate[] {
      return this.$accessor.dmm.dates
    },

    formattedEpochs(): Record<string, any>[] {
      const { epochs, maxEpochReward } = this
      let position = 0

      return epochs.map((epoch, index) => {
        const percentage = new BigNumberInBase(epoch.rewardInjNum)
          .dividedBy(maxEpochReward)
          .times(100)
          .toFormat(UI_DEFAULT_DMM_DECIMALS)
        position = position + Number(percentage)

        return {
          id: `${epoch.id}-${index}`,
          percentage,
          position: position - Number(percentage)
        }
      })
    },

    totalPastEpochPercentage(): number {
      const { formattedEpochs } = this

      return formattedEpochs
        .reduce(
          (total, epoch) => total.plus(new BigNumberInBase(epoch.percentage)),
          ZERO_IN_BASE
        )
        .toPrecision(UI_DEFAULT_DMM_DECIMALS)
    }
  }
})
</script>
