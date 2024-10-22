<script lang="ts" setup>
import { CampaignV2, LeaderboardRow } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, formatWalletAddress } from '@injectivelabs/utils'
import {
  MAXIMUM_RANKED_TRADERS,
  MIN_COMPETITION_PNL_AMOUNT,
  LEADERBOARD_VOLUME_PER_ENTRY,
  MAXIMUM_LEADERBOARD_STATS_RANK,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

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
  formatWalletAddress(props.leader.account)
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

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      props.campaign.type === LeaderboardType.Pnl
        ? props.leader.pnl
        : props.leader.volume
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const entries = computed(() =>
  new BigNumberInBase(props.leader.volume)
    .dividedBy(LEADERBOARD_VOLUME_PER_ENTRY)
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

      <div class="font-medium text-sm leading-5">{{ formattedAddress }}</div>

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
            <span v-if="campaign.type === LeaderboardType.Pnl">
              {{ `${amountToBigNumber.gte(0) ? '+' : ''}` }}
            </span>
            <span v-else>$</span>
            <span>
              {{ amountToFormat }}
            </span>
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
