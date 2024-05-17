<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

const {
  showUnverifiedAssets,
  userBalancesWithToken,
  accountBalancesWithToken
} = useBalance()

const search = ref('')

const balances = computed(() => {
  if (!showUnverifiedAssets.value) {
    return [...accountBalancesWithToken.value]
  }

  return [...userBalancesWithToken.value, ...accountBalancesWithToken.value]
})

const balancesSorted = computed(() => {
  const filteredBalances = balances.value.filter((balance) => {
    const isIncludedInSymbol = balance.token.symbol
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const isIncludedInName = balance.token.name
      .toLowerCase()
      .includes(search.value.toLowerCase())

    const isPartOfSearch =
      !search.value || isIncludedInSymbol || isIncludedInName
    const hasBalance = new BigNumberInBase(balance.accountTotalBalance).gte(1)

    return hasBalance && isPartOfSearch
  })

  return filteredBalances.sort((a, b) => {
    const aBalanceInToken = sharedToBalanceInTokenInBase({
      value: a.accountTotalBalanceInUsd,
      decimalPlaces: a.token.decimals
    })

    const bBalanceInToken = sharedToBalanceInTokenInBase({
      value: b.accountTotalBalanceInUsd,
      decimalPlaces: b.token.decimals
    })

    return aBalanceInToken.gt(bBalanceInToken) ? -1 : 1
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
