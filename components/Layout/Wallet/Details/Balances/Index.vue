<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { INJ_DENOM } from '@shared/utils/constant'
import { sharedToBalanceInTokenInBase } from '@shared/utils/formatter'

const { subaccount } = useSubaccounts()
const { userBalancesWithToken } = useBalance()

const balancesSorted = computed(() => {
  const filteredBalances = userBalancesWithToken.value.filter((balance) => {
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

    <div class="border-t py-2 mt-2 divide-y max-h-96 overflow-y-auto">
      <LayoutWalletDetailsBalancesRow
        v-for="balance in balancesSorted"
        :key="balance.denom"
        v-bind="{ balance }"
      />
    </div>
  </div>
</template>
