<script setup lang="ts">
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'

const accountStore = useAccountStore()

const { aggregatedPortfolioBalances } = useBalance()

const { valueToString: accountTotalBalanceInUsdToString } =
  useBigNumberFormatter(
    computed(
      () =>
        aggregatedPortfolioBalances.value[accountStore.subaccountId]?.reduce(
          (total, balance) =>
            total.plus(
              new BigNumberInWei(balance.accountTotalBalanceInUsd).toBase(
                balance.token.decimals
              )
            ),
          ZERO_IN_BASE
        ) || ZERO_IN_BASE
    ),
    {
      decimalPlaces: 2
    }
  )
</script>

<template>
  <div class="h-header flex">
    <CommonSubaccountTabSelector />

    <div class="flex divide-x border-r flex-1">
      <div class="flex items-center">
        <p class="text-sm text-gray-300 px-4 flex items-center space-x-2">
          <span>Total: </span>
          <CommonSkeletonSubaccountAmount>
            <span>${{ accountTotalBalanceInUsdToString }}</span>
          </CommonSkeletonSubaccountAmount>
        </p>
      </div>

      <label class="flex px-4 flex-1">
        <div class="flex items-center">
          <BaseIcon name="search" class="text-gray-500" />
        </div>
        <input
          class="p-2 bg-transparent focus:outline-none flex-1"
          placeholder="Filter by asset"
        />
      </label>

      <div class="flex items-center px-4">
        <AppCheckbox> Show Margin Currency Only </AppCheckbox>
      </div>

      <div class="flex items-center px-4">
        <AppCheckbox> Hide Small Balances </AppCheckbox>
      </div>
    </div>
  </div>
</template>
