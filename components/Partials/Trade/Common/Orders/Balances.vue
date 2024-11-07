<script setup lang="ts">
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

const isMobile = useIsMobile()
const { userBalancesWithToken } = useBalance()

const balancesSorted = computed(() => {
  const filteredBalances = userBalancesWithToken.value.filter((balance) => {
    const hasBalance =
      new BigNumberInBase(balance.accountTotalBalance).gte(1) ||
      new BigNumberInBase(balance.availableMargin).gte(1) ||
      new BigNumberInBase(balance.bankBalance).gte(1)

    return hasBalance
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
    <PartialsPortfolioBalancesSubaccountTableHeader
      v-if="!isMobile"
      class="bg-brand-850"
    />
    <div v-if="isMobile" class="divide-y">
      <PartialsPortfolioBalancesSubaccountTableMobileRow
        v-for="balance in balancesSorted"
        v-bind="{ balance }"
        :key="balance.denom"
      />
    </div>

    <template v-else>
      <PartialsPortfolioBalancesSubaccountTableRow
        v-for="balance in balancesSorted"
        v-bind="{ balance }"
        :key="balance.denom"
      />
    </template>
  </div>
</template>
