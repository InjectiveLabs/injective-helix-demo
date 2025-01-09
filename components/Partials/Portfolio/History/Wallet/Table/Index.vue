<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  HistoryWalletTableColumn,
  UiSubaccountTransactionWithToken
} from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    transactions: UiSubaccountTransactionWithToken[]
  }>(),
  {}
)

const { rows } = useHistoryWalletTransformer(computed(() => props.transactions))

const columns = [
  {
    key: HistoryWalletTableColumn.Time,
    label: t(`activity.table.historyWallet.${HistoryWalletTableColumn.Time}`)
  },
  {
    key: HistoryWalletTableColumn.Type,
    label: t(`activity.table.historyWallet.${HistoryWalletTableColumn.Type}`)
  },
  {
    key: HistoryWalletTableColumn.Asset,
    label: t(`activity.table.historyWallet.${HistoryWalletTableColumn.Asset}`)
  },
  {
    key: HistoryWalletTableColumn.Amount,
    label: t(`activity.table.historyWallet.${HistoryWalletTableColumn.Amount}`),
    class: 'text-right'
  },
  {
    key: HistoryWalletTableColumn.Origin,
    label: t(`activity.table.historyWallet.${HistoryWalletTableColumn.Origin}`)
  },
  {
    key: HistoryWalletTableColumn.Destination,
    label: t(
      `activity.table.historyWallet.${HistoryWalletTableColumn.Destination}`
    )
  }
]
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #time-data="{ row }">
        <div class="p-2">
          {{ row.time }}
        </div>
      </template>

      <template #type-data="{ row }">
        <div class="p-2">
          {{ row.transferType }}
        </div>
      </template>

      <template #asset-data="{ row }">
        <div class="p-2 flex items-center space-x-2">
          <CommonTokenIcon :token="row.transaction.token" />

          <span class="font-semibold">
            {{ row.transaction.token.symbol }}
          </span>
        </div>
      </template>

      <template #amount-data="{ row }">
        <div class="p-2 flex items-center space-x-2 justify-end">
          <span>
            <AppAmount
              v-bind="{
                amount: row.amount.toFixed(),
                decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
              }"
          /></span>

          <span class="font-semibold text-coolGray-500">
            {{ row.transaction.token.symbol }}
          </span>
        </div>
      </template>

      <template #origin-data="{ row }">
        <div class="p-2 font-mono">
          <PartialsWalletHistoryCommonAddress
            is-xs
            :address="row.transaction.sender"
          >
            {{ row.formattedOrigin }}
          </PartialsWalletHistoryCommonAddress>
        </div>
      </template>

      <template #destination-data="{ row }">
        <div class="p-2 font-mono">
          <PartialsWalletHistoryCommonAddress
            is-xs
            :address="row.transaction.receiver"
          >
            {{ row.formattedDestination }}
          </PartialsWalletHistoryCommonAddress>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioHistoryWalletMobileTable
      v-for="transaction in rows"
      :key="transaction.transaction.explorerLink"
      v-bind="{ transaction, columns }"
    />
  </template>
</template>
