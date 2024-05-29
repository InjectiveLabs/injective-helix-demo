<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

const { subaccount } = useSubaccounts()
const {
  showUnverifiedAssets,
  verifiedHoldingsWithToken,
  userBalancesWithToken
} = useBalance()

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

    const isPartOfSearch = isIncludedInSymbol || isIncludedInName
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
  <div>
    <div class="flex justify-between items-center pt-8">
      <p class="text-gray-400 text-xs">{{ $t('portfolio.assetsFrom') }}:</p>

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
