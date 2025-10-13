<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { checkIsCampaignWithEntries } from '@/app/data/campaign'
import { LeaderboardType } from '@/types'

const isMobile = useIsMobile()

const props = withDefaults(
  defineProps<{
    campaign?: CampaignV2
    isHideAmount?: boolean
  }>(),
  {
    campaign: undefined
  }
)

const isCampaignWithEntries = computed(() =>
  checkIsCampaignWithEntries(props.campaign?.name || '')
)
</script>

<template>
  <div
    v-if="campaign"
    :class="{
      'competition-table': !isMobile,
      'competition-table-mobile': isMobile,
      'is-campaign-with-entries': isCampaignWithEntries
    }"
  >
    <div>
      <div class="max-lg:-ml-3">
        {{ $t('leaderboard.header.rank') }}
      </div>
    </div>

    <div>
      {{ $t('leaderboard.header.address') }}
    </div>

    <template v-if="!isMobile">
      <div
        v-if="!isHideAmount || campaign.type === LeaderboardType.Volume"
        class="w-full"
      >
        {{
          $t(
            `leaderboard.header.${
              campaign.type === LeaderboardType.Volume
                ? 'allMarketsVolume'
                : 'tradingPnl'
            }`
          )
        }}
      </div>
      <div v-else />

      <template v-if="isCampaignWithEntries">
        <span class="block md:hidden xl:block">
          {{ $t('leaderboard.header.numberOfEntries') }}
        </span>
        <span class="hidden md:block xl:hidden">
          {{ $t('leaderboard.header.entries') }}
        </span>
      </template>
    </template>

    <div v-else>
      <span>
        {{
          $t(
            `leaderboard.header.${
              campaign.type === LeaderboardType.Volume ? 'volume' : 'tradingPnl'
            }`
          )
        }}
        <template v-if="isCampaignWithEntries">/</template>
      </span>

      <template v-if="isCampaignWithEntries">
        <span class="block md:hidden xl:block">
          {{ $t('leaderboard.header.numberOfEntries') }}
        </span>
        <span class="hidden md:block xl:hidden">
          {{ $t('leaderboard.header.entries') }}
        </span>
      </template>
    </div>
  </div>
</template>
