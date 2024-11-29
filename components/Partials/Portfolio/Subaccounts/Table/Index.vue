<script setup lang="ts">
import { SubAccount, PortfolioSubaccountsTableColumn } from '@/types'

const { t } = useLang()
const { aggregatedPortfolioBalances } = useBalance()

const props = withDefaults(
  defineProps<{
    subAccounts: SubAccount[]
  }>(),
  {}
)

const { rows } = useSubaccountsTransformer(
  computed(() => props.subAccounts),
  computed(() => aggregatedPortfolioBalances.value)
)

const columns = [
  {
    key: PortfolioSubaccountsTableColumn.Name,
    label: t(
      `portfolio.table.subaccounts.${PortfolioSubaccountsTableColumn.Name}`
    ),
    class: 'w-1/3'
  },
  {
    key: PortfolioSubaccountsTableColumn.Address,
    label: t(
      `portfolio.table.subaccounts.${PortfolioSubaccountsTableColumn.Address}`
    )
  },
  {
    key: PortfolioSubaccountsTableColumn.TotalUsd,
    label: t(
      `portfolio.table.subaccounts.${PortfolioSubaccountsTableColumn.TotalUsd}`
    ),
    class: 'text-right'
  }
]
</script>

<template>
  <UTable :rows="rows" :columns="columns" :ui="{ base: 'w-full' }">
    <template #name-data="{ row }">
      <div class="items-center p-2 break-all text-wrap">
        {{ $t('account.subaccount') }} {{ row.display }}
      </div>
    </template>

    <template #address-data="{ row }">
      <div class="items-center p-2">
        <PartialsWalletHistoryCommonAddress is-xs :address="row.value">
          {{ row.formattedAddress }}
        </PartialsWalletHistoryCommonAddress>
      </div>
    </template>

    <template #total-usd-data="{ row }">
      <div class="items-center p-2 text-right break-all text-wrap">
        <span class="mr-1">$</span>
        <AppUsdAmount
          v-bind="{
            amount: row.balance.toFixed()
          }"
        />
      </div>
    </template>
  </UTable>
</template>
