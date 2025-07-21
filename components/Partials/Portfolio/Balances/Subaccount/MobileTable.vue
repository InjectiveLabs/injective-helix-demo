<script setup lang="ts">
import { injToken } from '@shared/data/token'
import { BalanceTableColumn } from '@/types'
import type { BigNumberInBase } from '@injectivelabs/utils'
import type { UTableColumn, TransformedBalances } from '@/types'

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
            <p class="font-medium text-coolGray-200 text-sm max-w-52 truncate">
              {{ balance.token.symbol }}
            </p>
            <p class="text-xs text-coolGray-500 max-w-52 truncate">
              {{ balance.token.name }}
            </p>
          </div>

          <SharedIcon
            v-if="balance.isVerified"
            name="check-shield"
            is-md
            class="text-green-500 ml-2"
          />
        </div>

        <PartialsPortfolioBalancesSubaccountTableActionBtns
          v-bind="{
            token: balance.token,
            isBridgable: balance.isBridgable
          }"
        />
      </div>
    </template>

    <template #available-data>
      <SharedAmount
        v-bind="{
          amount: balance[BalanceTableColumn.Available].toFixed()
        }"
      />
    </template>

    <template #used-or-reserved-data>
      <SharedAmount
        v-bind="{
          showZeroAsEmDash: true,
          amount: balance[BalanceTableColumn.UsedOrReserved].toFixed()
        }"
      />
    </template>

    <template #unrealized-pnl-data>
      <SharedAmount
        v-bind="{
          showZeroAsEmDash: true,
          amount: balance[BalanceTableColumn.UnrealizedPnl].toFixed()
        }"
      />
    </template>

    <template #total-data>
      <SharedAmount
        v-bind="{
          amount: balance[BalanceTableColumn.Total].toFixed()
        }"
      />
    </template>

    <template #total-usd-data>
      <div v-if="balance.isVerified">
        <SharedAmountUsd
          v-bind="{
            amount: balance[BalanceTableColumn.TotalUsd].toFixed()
          }"
        >
          <template #prefix>
            <span>$</span>
          </template>
        </SharedAmountUsd>
      </div>
      <span v-else>&mdash;</span>
    </template>

    <template #staked-data>
      <SharedAmount
        v-bind="{
          amount: stakedAmount.toFixed()
        }"
      />
    </template>

    <template #staked-usd-data>
      <div>
        <SharedAmountUsd
          v-bind="{
            amount: stakedAmountInUsd.toFixed()
          }"
        >
          <template #prefix>
            <span>$</span>
          </template>
        </SharedAmountUsd>
      </div>
    </template>
  </AppMobileTable>
</template>
