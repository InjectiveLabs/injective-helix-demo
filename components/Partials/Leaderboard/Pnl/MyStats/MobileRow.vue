<script lang="ts" setup>
import { LeaderboardRow } from '@injectivelabs/sdk-ts'
import { formatWalletAddress, BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

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

const { valueToString: pnlToFormat, valueToBigNumber: pnlToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.leader.pnl),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const isUnranked = computed(() => {
  const isLowEarningsTrader = new BigNumberInBase(props.leader.pnl).lt(50)
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

      <div class="flex justify-between mt-3">
        <div class="flex flex-col items-start gap-y-1">
          <div class="text-[11px] leading-3">
            {{ $t('leaderboard.header.tradingPnl') }}
          </div>
          <div class="font-medium text-sm">
            {{ `${pnlToBigNumber.gte(0) ? '+' : '-'}${pnlToFormat}` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
