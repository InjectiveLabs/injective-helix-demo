<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { CampaignV2, LeaderboardRow } from '@injectivelabs/sdk-ts'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import {
  MAXIMUM_RANKED_TRADERS,
  DEFAULT_TRUNCATE_LENGTH,
  MIN_COMPETITION_PNL_AMOUNT,
  MAXIMUM_LEADERBOARD_STATS_RANK
} from '@/app/utils/constants'
import { checkIsCampaignWithEntries } from '@/app/data/campaign'
import { LeaderboardType, LeaderboardSubPage } from '@/types'

const route = useRoute()
const isMobile = useIsMobile()

const props = withDefaults(
  defineProps<{
    campaign?: CampaignV2
    leader?: LeaderboardRow
  }>(),
  {
    leader: () => ({
      pnl: 0,
      rank: 0,
      volume: 0,
      account: ''
    }),
    campaign: undefined
  }
)

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(props.leader.account, DEFAULT_TRUNCATE_LENGTH)
)

const isCampaignWithEntries = computed(() =>
  checkIsCampaignWithEntries(props.campaign?.name || '')
)

const isShowRank = computed(() => {
  if (!props.campaign) {
    return
  }

  const amount =
    props.campaign.type === LeaderboardType.Pnl
      ? props.leader.pnl
      : props.leader.volume

  const isTop100AndPositivePnL =
    new BigNumberInBase(props.leader.rank).lte(
      MAXIMUM_LEADERBOARD_STATS_RANK
    ) && new BigNumberInBase(amount).gte(0)

  if (isTop100AndPositivePnL) {
    return true
  }

  const isMoreThanMinimumPnL = new BigNumberInBase(amount).gte(
    MIN_COMPETITION_PNL_AMOUNT
  )

  const isTop500 = new BigNumberInBase(props.leader.rank).lte(
    MAXIMUM_RANKED_TRADERS
  )

  return isMoreThanMinimumPnL && isTop500
})
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
    <div class="font-semibold ml-1">
      {{ isShowRank ? leader.rank : $t('leaderboard.competition.unranked') }}
    </div>

    <div>
      <span class="font-light font-mono">
        <div class="md:hidden flex items-center text-xs lowercase space-x-2">
          <div>
            {{ formattedAddress }}
          </div>
          <div v-if="leader.rank === 1">
            {{ $t('leaderboard.competition.currentLeaderMobile') }}
          </div>
        </div>
        <div
          class="hidden md:flex justify-start items-center space-x-1 xl:space-x-4"
          :class="[
            leader.rank > 1
              ? 'text-xs lg:text-sm'
              : 'text-xs lg:text-sm 2xl:text-base'
          ]"
        >
          <div>
            {{ leader.account }}
          </div>
          <div
            v-if="
              leader.rank === 1 &&
              route.name !== LeaderboardSubPage.PastCompetitions
            "
          >
            <div
              class="text-xs 3xl:text-sm hidden 2xl:inline-flex bg-[#F06703] text-white uppercase font-semibold py-1 px-1.5 leading-4 rounded-[4px] gap-0.5 items-center"
            >
              <div>
                {{ $t('leaderboard.competition.currentLeader') }}
              </div>
              <div class="-mt-[2px] text-sm">
                {{ $t('leaderboard.competition.currentLeaderFlame') }}
              </div>
            </div>
            <div class="2xl:hidden">
              {{ $t('leaderboard.competition.currentLeaderMobile') }}
            </div>
          </div>
        </div>
      </span>
    </div>

    <template v-if="!isMobile">
      <PartialsLeaderboardCompetitionAmountEntries
        v-bind="{
          campaign,
          pnl: leader.pnl,
          volume: leader.volume,
          address: leader.account
        }"
      />
    </template>

    <template v-else>
      <div>
        <PartialsLeaderboardCompetitionAmountEntries
          v-bind="{
            campaign,
            pnl: leader.pnl,
            volume: leader.volume,
            address: leader.account
          }"
        />
      </div>
    </template>
  </div>
</template>
