<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { BigNumberInBase } from '@injectivelabs/utils'
import { UTableColumn, TransformedBalances, BalanceTableColumn } from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    balance: TransformedBalances
    stakedAmount: BigNumberInBase
    stakedAmountInUsd: BigNumberInBase
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const isInjColumn = props.balance.token.denom === injToken.denom
    const removedKey = [BalanceTableColumn.Assets]

    if (!isInjColumn) {
      removedKey.push(BalanceTableColumn.Staked, BalanceTableColumn.StakedUsd)
    }

    if (removedKey.includes(column.key as BalanceTableColumn)) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)
</script>

<template>
  <AppMobileTable :columns="filteredColumns">
    <template #header>
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <div class="flex items-center space-x-2 font-sans">
          <CommonTokenIcon v-bind="{ token: balance.token }" :is-sm="true" />
          <div class="ml-2">
            <p class="font-medium text-coolGray-200 text-sm">
              {{ balance.token.symbol }}
            </p>
            <p class="text-xs text-coolGray-500">{{ balance.token.name }}</p>
          </div>
        </div>

        <PartialsPortfolioBalancesSubaccountTableActionBtns
          v-bind="{
            token: balance.token,
            isVerified: balance.isVerified,
            isBridgable: balance.isBridgable
          }"
        />
      </div>
    </template>

    <template #available-data>
      <AppBalanceAmount
        v-bind="{ amount: balance[BalanceTableColumn.Available].toFixed() }"
      />
    </template>

    <template #used-or-reserved-data>
      <AppBalanceAmount
        v-bind="{
          showZeroAsEmDash: true,
          amount: balance[BalanceTableColumn.UsedOrReserved].toFixed()
        }"
      />
    </template>

    <template #unrealized-pnl-data>
      <AppBalanceAmount
        v-bind="{
          showZeroAsEmDash: true,
          amount: balance[BalanceTableColumn.UnrealizedPnl].toFixed()
        }"
      />
    </template>

    <template #total-data>
      <AppBalanceAmount
        v-bind="{
          amount: balance[BalanceTableColumn.Total].toFixed()
        }"
      />
    </template>

    <template #total-usd-data>
      <div>
        <span>$</span>
        <AppUsdBalanceAmount
          v-bind="{
            amount: balance[BalanceTableColumn.TotalUsd].toFixed()
          }"
        />
      </div>
    </template>

    <template #staked-data>
      <AppBalanceAmount
        v-bind="{
          amount: stakedAmount.toFixed()
        }"
      />
    </template>

    <template #staked-usd-data>
      <div>
        <span>$</span>
        <AppUsdBalanceAmount
          v-bind="{
            amount: stakedAmountInUsd.toFixed()
          }"
        />
      </div>
    </template>
  </AppMobileTable>
</template>
