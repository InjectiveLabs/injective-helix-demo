<script lang="ts" setup>
import { LeaderboardRow } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, formatWalletAddress } from '@injectivelabs/utils'
import {
  MAXIMUM_RANKED_TRADERS,
  MIN_LEADERBOARD_TRADING_AMOUNT,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'

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
  const isLowEarningsTrader = new BigNumberInBase(props.leader.pnl).lt(
    MIN_LEADERBOARD_TRADING_AMOUNT
  )
  const isBottomRanked =
    !props.leader.rank || props.leader.rank > MAXIMUM_RANKED_TRADERS

  return isLowEarningsTrader || isBottomRanked
})
</script>

<template>
  <div class="pnl-table">
    <div>
      <div v-if="isUnranked">
        {{ $t('leaderboard.unranked') }}
      </div>
      <span
        v-else-if="leader.rank > 3 && leader.rank <= MAXIMUM_RANKED_TRADERS"
        class="font-semibold ml-1"
      >
        {{ leader.rank }}
      </span>
      <div
        v-else
        class="-ml-0.5 md:-ml-2 min-w-6 h-6 w-6 md:min-w-10 md:w-10 md:h-10"
      >
        <img :src="`/images/leaderboard/rank-${leader.rank}.svg`" />
      </div>
    </div>

    <div>
      <span class="font-medium">
        <span class="md:hidden text-xs lowercase">
          {{ formattedAddress }}
        </span>
        <span
          class="hidden md:block"
          :class="[leader.rank > 3 || isUnranked ? 'text-sm' : 'text-base']"
        >
          {{ leader.account }}
        </span>
      </span>
    </div>

    <div>
      <span class="text-[13px] md:text-sm mr-4">
        {{ `${pnlToBigNumber.gte(0) ? '+' : '-'}${pnlToFormat}` }}
      </span>
    </div>
  </div>
</template>
