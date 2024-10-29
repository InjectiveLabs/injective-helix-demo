<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { INJ_DENOM } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

const { subaccount } = useSubaccounts()
const {
  showUnverifiedAssets,
  verifiedHoldingsWithToken,
  userBalancesWithToken
} = useBalance()

const balances = computed(() => {
  if (!showUnverifiedAssets.value) {
    return verifiedHoldingsWithToken.value
  }

  return userBalancesWithToken.value
})

const balancesSorted = computed(() => {
  const filteredBalances = balances.value.filter((balance) => {
    const hasBalance =
      new BigNumberInBase(balance.accountTotalBalance).gte(1) ||
      new BigNumberInBase(balance.availableMargin).gte(1) ||
      new BigNumberInBase(balance.bankBalance).gte(1)

    return hasBalance
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
  <div>
    <div class="flex justify-between items-center pt-8">
      <p class="text-coolGray-400 text-xs">{{ $t('portfolio.assetsFrom') }}:</p>

      <CommonSubaccountOptions>
        <template #default="{ subaccountOptions }">
          <USelectMenu
            v-model="subaccount"
            class="w-44"
            value-attribute="value"
            :options="
              subaccountOptions.map((option) => ({
                value: option.value,
                label: `${$t('account.subaccount')} ${option.display}`
              }))
            "
          />
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
