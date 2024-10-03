<script lang="ts" setup>
import { CampaignV2 } from '@injectivelabs/sdk-ts'
import { LeaderboardType } from '@/types'

const isMobile = useIsMobile()

withDefaults(
  defineProps<{
    isHideAmount?: boolean
    campaign?: CampaignV2 | undefined
  }>(),
  {
    campaign: undefined,
    isHideAmount: false
  }
)
</script>

<template>
  <div
    v-if="campaign"
    :class="[isMobile ? 'competition-table-mobile' : 'competition-table']"
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
      <div v-if="!isHideAmount">
        <span>
          <span class="hidden lg:block">
            {{
              $t(
                `leaderboard.header.${
                  campaign.type === LeaderboardType.Volume
                    ? 'allMarkestVolume'
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

      <div>
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
                      ? 'allMarkestVolume'
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

        <div>
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
