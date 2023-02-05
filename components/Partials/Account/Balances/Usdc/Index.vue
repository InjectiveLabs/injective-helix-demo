<script lang="ts" setup>
import { PropType } from 'vue'
import { BigNumberInBase } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'
import { usdcTokenDenom } from '@/app/data/token'

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

const hasPeggyUsdcBalance = computed(() => {
  const balance = props.balances.find(
    (balance) =>
      balance.denom.toLowerCase() === usdcTokenDenom.USDC.toLowerCase()
  )

  return new BigNumberInBase(balance?.totalBalance || 0).gt(0)
})

function toggleUsdcBalances() {
  showUsdcBalances.value = !showUsdcBalances.value
}
</script>

<template>
  <tbody>
    <template v-if="balances.length > 1">
      <PartialsAccountBalancesUsdcHeader
        v-bind="{
          hideBalances,
          aggregatedBalance
        }"
        @drawer:toggle="toggleUsdcBalances"
      />

      <template v-if="showUsdcBalances">
        <PartialsAccountBalancesUsdcTableRow
          v-for="(usdcBalance, index) in balances"
          :key="usdcBalance.token.denom"
          :class="{
            'border-b-transparent': index < balances.length - 1
          }"
          v-bind="{
            hideBalances,
            hasPeggyUsdcBalance,
            isOpen: showUsdcBalances,
            balance: usdcBalance
          }"
        />
      </template>
    </template>
    <template v-else>
      <PartialsAccountBalancesTableRow
        :key="balances[0].token.denom"
        v-bind="{
          hideBalances,
          balance: balances[0]
        }"
      />
    </template>
  </tbody>
</template>
