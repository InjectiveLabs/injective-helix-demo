<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { usdcTokenDenom, usdcTokenDenoms } from '@/app/data/token'
import { AccountBalance } from '@/types'

const props = defineProps({
  hideBalances: Boolean,

  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  },

  aggregatedBalance: {
    type: Object as PropType<AccountBalance>,
    required: true
  }
})

const showUsdcBalances = ref(true)

const usdcBalances = computed(() =>
  props.balances.filter((balance) =>
    usdcTokenDenoms.includes(balance.token.denom)
  )
)

// default usdc balance to show on accounts page
const peggyUsdcetBalance = computed(() => {
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
  showUsdcBalances.value = !showUsdcBalances.value
}
</script>

<template>
  <tbody>
    <template v-if="hasPeggyUsdcBalance">
      <PartialsAccountBalancesAggregatedHeader
        v-bind="{
          ...$attrs,
          hideBalances,
          showUsdcBalances,
          aggregatedBalance
        }"
        @drawer:toggle="toggleUsdcBalances"
      />

      <template v-if="showUsdcBalances">
        <PartialsAccountBalancesAggregatedRow
          v-for="(usdcBalance, index) in usdcBalances"
          :key="usdcBalance.token.denom"
          :class="{
            'border-b-transparent': index < usdcBalances.length - 1
          }"
          v-bind="{
            ...$attrs,
            hideBalances,
            hasPeggyUsdcBalance,
            isOpen: showUsdcBalances,
            balance: usdcBalance,
            isHoldingSingleUsdcDenom: usdcBalances.length === 1
          }"
        />
      </template>
    </template>

    <PartialsAccountBalancesRow
      v-else-if="peggyUsdcetBalance"
      :key="peggyUsdcetBalance.denom"
      v-bind="{
        ...$attrs,
        hideBalances,
        balance: peggyUsdcetBalance
      }"
    />
  </tbody>
</template>
