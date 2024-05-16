<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'

const { userBalancesWithToken, accountBalancesWithToken } = useBalance()

const search = ref('')
const showUnverifiedAssets = ref(false)

function checkIsPartOfSearch(search: string, balance: AccountBalance) {
  const isIncludedInSymbol = balance.token.symbol
    .toLowerCase()
    .includes(search.toLowerCase())

  const isIncludedInName = balance.token.name
    .toLowerCase()
    .includes(search.toLowerCase())

  return isIncludedInSymbol || isIncludedInName
}

const balances = computed(() => {
  if (!showUnverifiedAssets.value) {
    return [...accountBalancesWithToken.value]
  }

  return [...userBalancesWithToken.value, ...accountBalancesWithToken.value]
})

const balancesSorted = computed(() => {
  const filteredBalances = balances.value.filter((balance) => {
    const isPartOfSearch = checkIsPartOfSearch(search.value, balance)
    const hasBalance = new BigNumberInWei(balance.accountTotalBalance).gte(1)

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
  <div class="border-y divide-y">
    <PartialsPortfolioBalancesSubaccountTabs
      v-model:search="search"
      v-model:showUnverifiedAssets="showUnverifiedAssets"
    />

    <PartialsPortfolioBalancesSubaccountTableHeader />

    <PartialsPortfolioBalancesSubaccountTableRow
      v-for="balance in balancesSorted"
      v-bind="{ balance }"
      :key="balance.denom"
    />
  </div>
</template>
