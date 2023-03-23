<script lang="ts" setup>
import { PropType } from 'vue'
import { AccountBalance } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

const props = defineProps({
  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const isWHSolUSDTDenom = computed(
  () => props.balance.token.denom === usdcTokenDenom.USDCso
)

const isPeggyEthUSDTDenom = computed(
  () => props.balance.token.denom === usdcTokenDenom.USDC
)

const isWHEthUSDTDenom = computed(
  () => props.balance.token.denom === usdcTokenDenom.USDCet
)
</script>

<template>
  <span
    class="flex items-center justify-center rounded p-1 text-xs font-bold tracking-tight bg-gray-500 text-white"
    :class="{
      'bg-gray-500': isPeggyEthUSDTDenom || isWHSolUSDTDenom,
      'bg-blue-550': isWHEthUSDTDenom
    }"
  >
    <span v-if="isPeggyEthUSDTDenom">{{ $t('account.injectiveBridge') }}</span>
    <span v-if="isWHEthUSDTDenom">{{ $t('account.wormhole') }}</span>
    <span v-if="isWHSolUSDTDenom">{{ $t('account.solana') }}</span>
  </span>
</template>
