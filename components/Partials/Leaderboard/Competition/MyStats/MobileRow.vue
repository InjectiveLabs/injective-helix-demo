<script lang="ts" setup>
import { NuxtUiIcons } from '@shared/types'
import { getExplorerUrl } from '@shared/utils/network'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import { competitionVolumePerEntryMap } from '@/app/data/campaign'
import {
  MAXIMUM_RANKED_TRADERS,
  DEFAULT_TRUNCATE_LENGTH,
  MIN_COMPETITION_PNL_AMOUNT,
  MAXIMUM_LEADERBOARD_STATS_RANK
} from '@/app/utils/constants'
import { LeaderboardType } from '@/types'
import type { CampaignV2, LeaderboardRow } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    campaign: CampaignV2
    leader?: LeaderboardRow
  }>(),
  {
    leader: () => ({
      pnl: 0,
      rank: 0,
      volume: 0,
      account: ''
    })
  }
)

const formattedAddress = computed(() =>
  sharedEllipsisFormatText(props.leader.account, DEFAULT_TRUNCATE_LENGTH)
)

const isShowRank = computed(() => {
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

const amount = computed(() =>
  props.campaign.type === LeaderboardType.Pnl
    ? props.leader.pnl
    : props.leader.volume
)
const amountToBigNumber = computed(() => new BigNumberInBase(amount.value))

const entries = computed(() =>
  new BigNumberInBase(props.leader.volume)
    .dividedBy(competitionVolumePerEntryMap[props.campaign.name] || 1000)
    .integerValue(BigNumberInBase.ROUND_DOWN)
)
</script>

<template>
  <div class="grid grid-cols-[50px_1fr] ml-4 gap-7">
    <div class="h-full-flex items-start gap-y-1">
      <div class="text-[11px] leading-3">
        {{ $t('leaderboard.header.rank') }}
      </div>
      <div class="text-sm font-semibold leading-5">
        {{ isShowRank ? leader.rank : $t('leaderboard.competition.unranked') }}
      </div>
    </div>

    <div class="h-full-flex items-start gap-y-1">
      <div class="font-medium text-[11px] leading-3">
        {{ $t('leaderboard.header.address') }}
      </div>

      <NuxtLink
        target="_blank"
        class="flex items-center gap-2"
        :to="`${getExplorerUrl()}/account/${leader.account}`"
      >
        <div class="font-medium text-sm leading-5">{{ formattedAddress }}</div>
        <UIcon class="size-4" :name="NuxtUiIcons.ExternalLink2" />
      </NuxtLink>

      <div class="flex justify-between mt-3 space-x-10">
        <div v-if="isShowRank" class="flex flex-col items-start gap-y-1">
          <div class="text-[11px] leading-3">
            {{
              $t(
                `leaderboard.header.${
                  campaign.type === LeaderboardType.Volume
                    ? 'volume'
                    : 'tradingPnl'
                }`
              )
            }}
          </div>
          <div class="font-medium text-sm">
            <SharedAmountUsd
              v-bind="{
                amount,
                shouldAbbreviate: false
              }"
            >
              <template #prefix>
                <span v-if="campaign.type === LeaderboardType.Pnl">
                  {{ `${amountToBigNumber.gte(0) ? '+' : ''}` }}
                </span>
                <span v-else>$</span>
              </template>
            </SharedAmountUsd>
          </div>
        </div>

        <div class="flex flex-col items-start gap-y-1">
          <div class="text-[11px] leading-3">
            {{ $t('leaderboard.header.numberOfEntries') }}
          </div>
          <div class="font-medium text-sm">
            {{ entries }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
