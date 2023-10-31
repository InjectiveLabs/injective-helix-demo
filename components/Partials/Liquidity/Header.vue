<script setup lang="ts">
import { format } from 'date-fns'
import { Campaign } from '@injectivelabs/sdk-ts'
import {
  CAMPAIGN_INJ_REWARDS,
  CAMPAIGN_TIA_REWARDS
} from '@/app/utils/constants'
import { UiMarketWithToken } from 'types'

const props = defineProps({
  campaign: {
    type: Object as PropType<Campaign>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    default: undefined
  }
})

const DATE_FORMAT = 'MMM dd, yyyy'

const { valueToString: injRewardsToString } = useBigNumberFormatter(
  computed(() => CAMPAIGN_INJ_REWARDS)
)

const { valueToString: tiaRewardsToString } = useBigNumberFormatter(
  computed(() => CAMPAIGN_TIA_REWARDS)
)

const endDate = computed(() => format(props.campaign.endDate, DATE_FORMAT))
</script>

<template>
  <div class="flex mt-8">
    <div class="flex-1">
      <div class="pb-4">
        <h2 class="text-3xl font-bold">
          {{ $t('campaign.title') }}
        </h2>
        <p>{{ $t('campaign.description') }}</p>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[auto_auto_auto] gap-2 mt-4"
      >
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.totalRewards') }}
          </p>
          <h2 class="text-2xl font-semibold">
            {{ injRewardsToString }} INJ + {{ tiaRewardsToString }} TIA
          </h2>
        </div>
        <div v-if="market">
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.eligibleMarkets') }}
          </p>
          <h2 class="text-2xl font-semibold">{{ market.ticker }}</h2>
        </div>
        <div>
          <p class="text-gray-600 text-sm mb-2">
            {{ $t('campaign.endTime') }}
          </p>
          <h2 class="text-2xl font-semibold">{{ endDate }}</h2>
        </div>
      </div>
    </div>

    <div class="hidden sm:block pl-4">
      <img src="/svg/leaderboard_graphic.svg" />
    </div>
  </div>
</template>
