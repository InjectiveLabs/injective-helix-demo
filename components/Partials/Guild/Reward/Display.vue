<script lang="ts" setup>
import { toBalanceInToken } from '@/app/utils/formatters'
import { UI_DEFAULT_MAX_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { RewardWithToken } from '@/types'

const props = withDefaults(defineProps<{ reward: RewardWithToken }>(), {})

const { valueToString: rewardToString } = useSharedBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.reward.amount,
      decimalPlaces: props.reward.token.decimals
    })
  ),
  {
    decimalPlaces: UI_DEFAULT_MAX_DISPLAY_DECIMALS,
    minimalDecimalPlaces: UI_DEFAULT_MAX_DISPLAY_DECIMALS
  }
)
</script>

<template>
  <div class="flex items-center gap-1">
    <CommonTokenIcon :token="reward.token" is-sm />
    <span>≈ {{ rewardToString }}</span>
  </div>
</template>
