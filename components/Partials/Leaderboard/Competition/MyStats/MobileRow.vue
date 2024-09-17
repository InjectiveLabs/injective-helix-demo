<script lang="ts" setup>
import { LeaderboardRow } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, formatWalletAddress } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

const campaignStore = useCampaignStore()

const props = withDefaults(
  defineProps<{
    leader: LeaderboardRow
  }>(),
  {
    leader: () => ({
      account: '',
      rank: 0,
      pnl: 0,
      volume: 0
    })
  }
)

const formattedAddress = computed(() =>
  formatWalletAddress(props.leader.account)
)

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      campaignStore.activeCampaignType === LeaderboardType.Pnl
        ? props.leader.pnl
        : props.leader.volume
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const entries = computed(() =>
  new BigNumberInBase(props.leader.volume)
    .dividedBy(10)
    .integerValue(BigNumberInBase.ROUND_FLOOR)
)

const isUnranked = computed(() => {
  const amount =
    campaignStore.activeCampaignType === LeaderboardType.Pnl
      ? props.leader.pnl
      : props.leader.volume

  const isLowEarningsTrader = new BigNumberInBase(amount).lt(50)
  const isBottomRanked = !props.leader.rank || props.leader.rank > 500

  return isLowEarningsTrader || isBottomRanked
})
</script>

<template>
  <div class="grid grid-cols-[38px_1fr] ml-4 gap-7">
    <div class="h-full-flex items-start gap-y-1">
      <div class="text-[11px] leading-3 mb-1">
        {{ $t('leaderboard.header.rank') }}
      </div>
      <div class="text-sm font-semibold leading-4">
        {{ isUnranked ? $t('leaderboard.unranked') : leader.rank }}
      </div>
    </div>

    <div class="h-full-flex items-start gap-y-1">
      <div class="font-medium text-[11px] leading-3">
        {{ $t('leaderboard.header.address') }}
      </div>

      <div class="font-medium text-sm leading-5">{{ formattedAddress }}</div>

      <div class="flex justify-between mt-3 space-x-10">
        <div class="flex flex-col items-start gap-y-1">
          <div class="text-[11px] leading-3">
            {{
              $t(
                `leaderboard.header.${
                  campaignStore.activeCampaignType === LeaderboardType.Volume
                    ? 'volume'
                    : 'tradingPnl'
                }`
              )
            }}
          </div>
          <div class="font-medium text-sm">
            <span
              v-if="campaignStore.activeCampaignType === LeaderboardType.Pnl"
            >
              {{ `${amountToBigNumber.gte(0) ? '+' : '-'}` }}
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
