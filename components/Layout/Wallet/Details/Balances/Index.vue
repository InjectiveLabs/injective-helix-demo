<script setup lang="ts">
import { BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance } from '~/types'

const { subaccount } = useSubaccounts()

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
  <div>
    <div class="flex justify-between items-center pt-8">
      <p class="text-gray-400 text-xs">Assets From:</p>

      <CommonSubaccountOptions>
        <template #default="{ subaccountOptions }">
          <AppSelect
            v-model="subaccount"
            v-bind="{ options: subaccountOptions }"
            wrapper-class="border border-brand-700 py-1 px-3 rounded hover:bg-brand-800"
          >
            <template #default="{ selected }">
              <span class="select-none text-blue-500 text-sm">
                {{ $t('account.subaccount') }} {{ selected?.display }}
              </span>
            </template>

            <template #option="{ option }">
              <span class="select-none text-sm">
                {{ $t('account.subaccount') }} {{ option.display }}
              </span>
            </template>
          </AppSelect>
        </template>
      </CommonSubaccountOptions>
    </div>

    <div class="border-t py-2 mt-2 divide-y">
      <LayoutWalletDetailsBalancesRow
        v-for="balance in balancesSorted"
        :key="balance.denom"
        v-bind="{ balance }"
      />
    </div>
  </div>
</template>
