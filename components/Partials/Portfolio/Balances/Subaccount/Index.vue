<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { INJ_DENOM } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

const {
  showUnverifiedAssets,
  verifiedHoldingsWithToken,
  userBalancesWithToken
} = useBalance()

const isMobile = useIsMobile()

const search = ref('')

const balances = computed(() => {
  if (!showUnverifiedAssets.value) {
    return verifiedHoldingsWithToken.value
  }

  return userBalancesWithToken.value
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

    if (b.denom === INJ_DENOM) {
      return 1
    }

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

    <div class="overflow-x-auto">
      <div class="lg:min-w-[1300px] divide-y border-b">
        <PartialsPortfolioBalancesSubaccountTableHeader v-if="!isMobile" />

        <template v-if="isMobile">
          <PartialsPortfolioBalancesSubaccountTableMobileRow
            v-for="balance in balancesSorted"
            v-bind="{ balance }"
            :key="balance.denom"
          />
        </template>

        <template v-else>
          <PartialsPortfolioBalancesSubaccountTableRow
            v-for="balance in balancesSorted"
            v-bind="{ balance }"
            :key="balance.denom"
          />
        </template>
      </div>
    </div>
  </div>
</template>
