<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils'
import { usdcTokenDenom, usdcTokenDenoms } from '@/app/data/token'
import { AccountBalance } from '@/types'

const props = defineProps({
  isHideBalances: Boolean,
  isUnrealizedPnLLoading: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },

  aggregatedBalance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const isShowUsdcBalances = ref(true)

const usdcBalances = computed(() =>
  props.balances.filter((balance) =>
    usdcTokenDenoms.includes(balance.token.denom)
  )
)

// default usdc balance to show on accounts page
const defaultUsdcBalance = computed(() => {
  return props.balances.find(
    (balance) => balance.denom === usdcTokenDenom.USDCet
  )
})

const hasPeggyUsdcBalance = computed(() => {
  const balance = props.balances.find(
    (balance) => balance.denom === usdcTokenDenom.USDC
  )

  return new BigNumberInBase(balance?.accountTotalBalance || 0).gt(0)
})

function toggleUsdcBalances() {
  isShowUsdcBalances.value = !isShowUsdcBalances.value
}
</script>

<template>
  <tbody>
    <template v-if="hasPeggyUsdcBalance">
      <PartialsAccountBalancesAggregatedHeader
        v-bind="{
          ...$attrs,
          isHideBalances,
          isShowUsdcBalances,
          aggregatedBalance
        }"
        @drawer:toggle="toggleUsdcBalances"
      />

      <template v-if="isShowUsdcBalances">
        <PartialsAccountBalancesAggregatedRow
          v-for="(usdcBalance, index) in usdcBalances"
          :key="usdcBalance.token.denom"
          :class="{
            'border-b-transparent': index < usdcBalances.length - 1
          }"
          v-bind="{
            ...$attrs,
            isHideBalances,
            hasPeggyUsdcBalance,
            isOpen: isShowUsdcBalances,
            balance: usdcBalance,
            isHoldingSingleUsdcDenom: usdcBalances.length === 1
          }"
        />
      </template>
    </template>

    <PartialsAccountBalancesRow
      v-else-if="defaultUsdcBalance"
      :key="defaultUsdcBalance.denom"
      v-bind="{
        ...$attrs,
        isHideBalances,
        balance: defaultUsdcBalance
      }"
    />
  </tbody>
</template>
