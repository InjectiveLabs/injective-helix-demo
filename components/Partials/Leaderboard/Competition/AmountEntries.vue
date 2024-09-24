<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  LEADERBOARD_VOLUME_PER_ENTRY,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

const campaignStore = useCampaignStore()

const props = defineProps({
  pnl: {
    type: Number,
    default: 0
  },

  volume: {
    type: Number,
    default: 0
  }
})

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      campaignStore.activeCampaignType === LeaderboardType.Pnl
        ? props.pnl
        : props.volume
    ),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )

const entries = computed(() =>
  new BigNumberInBase(props.volume)
    .dividedBy(LEADERBOARD_VOLUME_PER_ENTRY)
    .integerValue(BigNumberInBase.ROUND_DOWN)
)
</script>

<template>
  <div v-if="amountToBigNumber.gt(0)" class="text-[13px] md:text-sm mr-2">
    <span v-if="campaignStore.activeCampaignType === LeaderboardType.Pnl">
      {{ `${amountToBigNumber.gte(0) ? '+' : ''}` }}
    </span>
    <span v-else>$</span>
    <span>
      {{ amountToFormat }}
    </span>
  </div>
  <div v-else />

  <div>
    <span class="text-[13px] md:text-sm mr-2">
      {{ entries }}
    </span>
  </div>
</template>
