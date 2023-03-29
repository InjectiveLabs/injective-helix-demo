<script setup lang="ts">
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

const exchangeStore = useExchangeStore()

defineProps({
  hideBalances: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const showStaked = ref(false)

const hasStaked = computed(() => {
  if (
    !exchangeStore.feeDiscountAccountInfo ||
    !exchangeStore.feeDiscountAccountInfo.accountInfo
  ) {
    return false
  }

  return new BigNumberInBase(
    cosmosSdkDecToBigNumber(
      exchangeStore.feeDiscountAccountInfo.accountInfo.stakedAmount
    )
  ).gt(0)
})
</script>

<template>
  <template v-if="hasStaked">
    <PartialsAccountBalancesInjHeader
      v-bind="{
        ...$attrs,
        balance,
        hideBalances,
        showStaked
      }"
      @drawer:toggle="showStaked = !showStaked"
    />
    <PartialsAccountBalancesInjRowStaked v-if="showStaked" />
  </template>
  <template v-else>
    <PartialsAccountBalancesRow
      v-bind="{
        ...$attrs,
        balance,
        hideBalances
      }"
    />
  </template>
</template>
