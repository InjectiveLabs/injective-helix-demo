<script lang="ts" setup>
import { PropType } from 'vue'
import { AccountBalance } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

defineProps({
  isUsdcDenom: Boolean,

  balance: {
    required: true,
    type: Object as PropType<AccountBalance>
  }
})
</script>

<template>
  <span class="text-gray-500 text-xs">
    <span v-if="!isUsdcDenom">
      {{ balance.token.name }}
    </span>
    <span v-else-if="balance.token.denom === usdcTokenDenom.USDC">
      {{ $t('account.usdcPeggyToken') }}
    </span>
    <span v-else-if="balance.token.denom === usdcTokenDenom.USDCet">
      {{ $t('account.usdcWHEthereumToken') }}
    </span>
    <span v-else-if="balance.token.denom === usdcTokenDenom.USDCso">
      {{ $t('account.usdcWHSolanaToken') }}
    </span>
  </span>
</template>
