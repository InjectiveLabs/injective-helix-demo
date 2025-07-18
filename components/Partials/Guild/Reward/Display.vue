<script lang="ts" setup>
import { sharedToBalanceInToken } from '@shared/utils/formatter'
import type { RewardWithToken } from '@/types'

const props = withDefaults(defineProps<{ reward: RewardWithToken }>(), {})

const rewardToDisplay = computed(() =>
  sharedToBalanceInToken({
    value: props.reward.amount,
    decimalPlaces: props.reward.token.decimals
  })
)
</script>

<template>
  <div class="flex items-center gap-1">
    <CommonTokenIcon :token="reward.token" is-sm />
    <SharedAmount
      v-bind="{
        amount: rewardToDisplay
      }"
    >
      <template #prefix>≈</template>
    </SharedAmount>
  </div>
</template>
