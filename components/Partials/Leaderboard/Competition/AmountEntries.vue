<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { LeaderboardType } from '@/types'

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

const entries = computed(() =>
  new BigNumberInBase(props.amount)
    .dividedBy(100)
    .integerValue(BigNumberInBase.ROUND_FLOOR)
)
</script>

<template>
  <div class="text-[13px] md:text-sm mr-2">
    <span v-if="campaignStore.activeCampaignType === LeaderboardType.Pnl">
      {{ `${amountToBigNumber.gte(0) ? '+' : '-'}` }}
    </span>
    <span v-else>$</span>
    <span>
      {{ amountToFormat }}
    </span>
  </div>

  <div>
    <span class="text-[13px] md:text-sm mr-2">
      {{ entries }}
    </span>
  </div>
</template>
