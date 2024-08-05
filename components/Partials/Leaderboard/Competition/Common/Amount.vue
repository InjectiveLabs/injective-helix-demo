<script lang="ts" setup>
import { LeaderboardType } from '@/types'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'

const campaignStore = useCampaignStore()

const props = defineProps({
  amount: {
    type: Number,
    default: 0
  }
})

const { valueToString: amountToFormat, valueToBigNumber: amountToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() => props.amount),
    {
      decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
    }
  )
</script>

<template>
  <div>
    <span v-if="campaignStore.activeCampaignType === LeaderboardType.Pnl">
      {{ `${amountToBigNumber.gte(0) ? '+' : '-'}` }}
    </span>
    <span v-else>$</span>
    <span>
      {{ amountToFormat }}
    </span>
  </div>
</template>
