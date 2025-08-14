<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'

const { subaccount } = useSubaccounts()
const { activeSubaccountTradableBalancesWithToken } = useBalance()

const balancesSorted = computed(() => {
  const balances = activeSubaccountTradableBalancesWithToken.value

  const filteredBalances = balances.filter((balance) => {
    const hasBalance = new BigNumberInBase(balance.totalBalance).gte(1)

    return hasBalance
  })

  return filteredBalances.sort((a, b) => {
    const aBalanceInToken = new BigNumberInBase(a.totalBalanceInUsd)
    const bBalanceInToken = new BigNumberInBase(b.totalBalanceInUsd)

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
                label: `${$t('common.account.subaccount')} ${option.display}`
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
