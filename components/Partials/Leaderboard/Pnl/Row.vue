<script lang="ts" setup>
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

const { valueToString: pnlToFormat } = useSharedBigNumberFormatter(
  computed(() => props.pnl),
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <PartialsLeaderboardPnlRowWrapper>
    <template #column1>
      <span v-if="rank > 3" class="font-semibold ml-1">
        {{ rank }}
      </span>
      <div v-else class="-ml-2">
        <img :src="`/images/leaderboard/rank-${rank}.svg`" />
      </div>
    </template>

    <template #column2>
      <span class="lowercase font-medium">
        {{ account }}
      </span>
    </template>

    <template #column3> ${{ pnlToFormat }} </template>
  </PartialsLeaderboardPnlRowWrapper>
</template>
