<script setup lang="ts">
import { AccountBalance } from '@/types'

defineProps({
  hideBalances: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const showStaked = ref(false)
</script>

<template>
  <PartialsAccountBalancesInjHeader
    v-bind="$attrs"
    :balance="balance"
    :hide-balances="hideBalances"
    :show-staked="showStaked"
    @drawer:toggle="showStaked = !showStaked"
  />
  <PartialsAccountBalancesInjRowStaked v-if="showStaked" />
</template>
