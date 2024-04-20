<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

const { accountBalancesWithToken } = useBalance()

const search = ref('')

function checkIsPartOfSearch(search: string, balance: AccountBalance) {
  const isIncludedInSymbol = balance.token.symbol
    .toLowerCase()
    .includes(search.toLowerCase())

  const isIncludedInName = balance.token.name
    .toLowerCase()
    .includes(search.toLowerCase())

  return isIncludedInSymbol || isIncludedInName
}

const balancesSorted = computed(() => {
  const filteredBalances = accountBalancesWithToken.value.filter((balance) => {
    const hasBalance = new BigNumberInWei(balance.accountTotalBalance).gte(1)

    const isPartOfSearch = checkIsPartOfSearch(search.value, balance)
    return hasBalance && isPartOfSearch
  })

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
  <div class="divide-y">
    <PartialsPortfolioBalancesSubaccountTableHeader class="bg-brand-850" />

    <PartialsPortfolioBalancesSubaccountTableRow
      v-for="balance in balancesSorted"
      v-bind="{ balance }"
      :key="balance.denom"
    />
  </div>
</template>
