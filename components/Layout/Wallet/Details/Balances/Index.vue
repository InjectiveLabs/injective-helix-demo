<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

const { subaccount } = useSubaccounts()
const {
  showUnverifiedAssets,
  activeSubaccountBalancesWithToken,
  activeSubaccountTradableBalancesWithToken
} = useBalance()

const balancesSorted = computed(() => {
  const balances = showUnverifiedAssets.value
    ? activeSubaccountBalancesWithToken.value
    : activeSubaccountTradableBalancesWithToken.value

  const filteredBalances = balances.filter((balance) => {
    const hasBalance = new BigNumberInBase(balance.totalBalance).gte(1)

    return hasBalance
  })

  return filteredBalances.sort((a, b) => {
    const aBalanceInToken = sharedToBalanceInTokenInBase({
      value: a.totalBalanceInUsd,
      decimalPlaces: a.token.decimals
    })

    const bBalanceInToken = sharedToBalanceInTokenInBase({
      value: b.totalBalanceInUsd,
      decimalPlaces: b.token.decimals
    })

    if (a.denom === injToken.denom) {
      return -1
    }

    if (b.denom === injToken.denom) {
      return 1
    }

    return bBalanceInToken.minus(aBalanceInToken).toNumber()
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

    <div class="border-t py-2 mt-2 divide-y max-h-96 overflow-y-auto">
      <LayoutWalletDetailsBalancesRow
        v-for="balance in balancesSorted"
        :key="balance.denom"
        v-bind="{ balance }"
      />
    </div>
  </div>
</template>
