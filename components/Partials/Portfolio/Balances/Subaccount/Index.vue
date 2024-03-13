<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'

const { accountBalancesWithToken } = useBalance()

const balancesSorted = computed(() => {
  const filteredBalances = accountBalancesWithToken.value.filter((balance) =>
    new BigNumberInWei(balance.accountTotalBalance).gte(1)
  )

  return [...filteredBalances].sort((a, b) => {
    return new BigNumberInWei(a.accountTotalBalanceInUsd)
      .toBase(a.token.decimals)
      .gt(
        new BigNumberInWei(b.accountTotalBalanceInUsd).toBase(b.token.decimals)
      )
      ? -1
      : 1
  })
})
</script>

<template>
  <div class="border-y divide-y">
    <PartialsPortfolioBalancesSubaccountTabs />

    <PartialsPortfolioBalancesSubaccountTableHeader />
    <PartialsPortfolioBalancesSubaccountTableRow
      v-for="balance in balancesSorted"
      v-bind="{ balance }"
      :key="balance.denom"
    />
  </div>
</template>
