<script lang="ts" setup>
import { toBalanceInToken } from '@/app/utils/formatters'
import { RewardWithToken } from '@/types'

const props = defineProps({
  reward: {
    type: Object as PropType<RewardWithToken>,
    required: true
  }
})

const { valueToString: rewardToString } = useBigNumberFormatter(
  computed(() =>
    toBalanceInToken({
      value: props.reward.amount,
      decimalPlaces: props.reward.token.decimals
    })
  )
)
</script>

<template>
  <div class="flex items-center gap-1">
    <CommonTokenIcon :token="reward.token" is-sm />
    <span>{{ rewardToString }}</span>
  </div>
</template>
