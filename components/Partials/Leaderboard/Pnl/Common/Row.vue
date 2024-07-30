<script lang="ts" setup>
import { formatWalletAddress } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const props = defineProps({
  account: {
    type: String,
    default: ''
  },

  pnl: {
    type: Number,
    default: 0
  },

  rank: {
    type: Number,
    default: 0
  }
})

const formattedAddress = computed(() => formatWalletAddress(props.account))

const { valueToString: pnlToFormat, valueToBigNumber: pnlToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.pnl),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )
</script>

<template>
  <PartialsLeaderboardPnlCommonRowWrapper>
    <template #column1>
      <span v-if="rank > 3" class="font-semibold ml-1">
        {{ rank }}
      </span>
      <div
        v-else
        class="-ml-0.5 md:-ml-2 min-w-6 h-6 w-6 md:min-w-10 md:w-10 md:h-10"
      >
        <img :src="`/images/leaderboard/rank-${rank}.svg`" />
      </div>
    </template>

    <template #column2>
      <span class="font-medium">
        <span class="md:hidden text-xs lowercase">
          {{ formattedAddress }}
        </span>
        <span
          class="hidden md:block"
          :class="[rank > 3 ? 'text-sm' : 'text-base']"
        >
          {{ account }}
        </span>
      </span>
    </template>

    <template #column3>
      <span class="text-[13px] md:text-sm mr-4">
        {{ `${pnlToBigNumber.gte(0) ? '+' : '-'}${pnlToFormat}` }}
      </span>
    </template>
  </PartialsLeaderboardPnlCommonRowWrapper>
</template>
