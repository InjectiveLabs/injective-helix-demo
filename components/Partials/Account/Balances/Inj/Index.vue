<script lang="ts" setup>
import { cosmosSdkDecToBigNumber } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

const exchangeStore = useExchangeStore()
const accountStore = useAccountStore()

defineProps({
  isHideBalances: Boolean,

  balance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const isShowStaked = ref(false)

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

onMounted(() => {
  if (hasStaked.value) {
    isShowStaked.value = true
  }
})

function toggleDrawer() {
  isShowStaked.value = !isShowStaked.value
}
</script>

<template>
  <template v-if="hasStaked && accountStore.isDefaultSubaccount">
    <PartialsAccountBalancesInjHeader
      v-bind="{
        ...$attrs,
        balance,
        isHideBalances,
        isShowStaked
      }"
      @drawer:toggle="toggleDrawer"
    />
    <PartialsAccountBalancesInjRowStaked
      v-if="isShowStaked"
      v-bind="{ isHideBalances }"
    />
  </template>
  <template v-else>
    <PartialsAccountBalancesRow
      v-bind="{
        ...$attrs,
        balance,
        isHideBalances
      }"
    />
  </template>
</template>
