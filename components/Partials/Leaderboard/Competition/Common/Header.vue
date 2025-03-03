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
    campaign: undefined,
    isHideAmount: false
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
      <div v-if="!isHideAmount" class="w-full">
        <span>
          <span class="hidden lg:block">
            {{
              $t(
                `leaderboard.header.${
                  campaign.type === LeaderboardType.Volume
                    ? 'allMarketsVolume'
                    : 'tradingPnl'
                }`
              )
            }}
          </span>
          <span class="lg:hidden">
            {{
              $t(
                `leaderboard.header.${
                  campaign.type === LeaderboardType.Volume
                    ? 'volume'
                    : 'tradingPnl'
                }`
              )
            }}/
          </span>
        </span>
      </div>
      <div v-else />

      <div v-if="isCampaignWithEntries">
        <div class="lg:mr-2">
          <span class="block md:hidden xl:block">
            {{ $t('leaderboard.header.numberOfEntries') }}
          </span>
          <span class="hidden md:block xl:hidden">
            {{ $t('leaderboard.header.entries') }}
          </span>
        </div>
      </div>
    </template>

    <template v-else>
      <div>
        <div>
          <span>
            <span class="hidden lg:block">
              {{
                $t(
                  `leaderboard.header.${
                    campaign.type === LeaderboardType.Volume
                      ? 'allMarketsVolume'
                      : 'tradingPnl'
                  }`
                )
              }}
            </span>
            <span class="lg:hidden">
              {{
                $t(
                  `leaderboard.header.${
                    campaign.type === LeaderboardType.Volume
                      ? 'volume'
                      : 'tradingPnl'
                  }`
                )
              }}
            </span>
            <span v-if="isCampaignWithEntries">/</span>
          </span>
        </div>

        <div v-if="isCampaignWithEntries">
          <div class="lg:mr-2">
            <span class="block md:hidden xl:block">
              {{ $t('leaderboard.header.numberOfEntries') }}
            </span>
            <span class="hidden md:block xl:hidden">
              {{ $t('leaderboard.header.entries') }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
