<script setup lang="ts">
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import {
  UTableColumn,
  TransformedHistoryWallet,
  HistoryWalletTableColumn
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    transaction: TransformedHistoryWallet
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === HistoryWalletTableColumn.Asset) {
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
      <div class="flex flex-col gap-2 mb-6">
        <p class="text-white text-sm font-semibold">
          {{
            $t(`activity.table.historyWallet.${HistoryWalletTableColumn.Asset}`)
          }}
        </p>

        <div class="flex items-center space-x-2 font-sans">
          <CommonTokenIcon
            v-bind="{ token: transaction.transaction.token }"
            :is-sm="true"
          />
          <p class="text-sm text-coolGray-200">
            {{ transaction.transaction.token.symbol }}
          </p>
        </div>
      </div>
    </template>

    <template #time-data>
      <p>
        {{ transaction.time }}
      </p>
    </template>

    <template #type-data>
      <p class="text-right">
        {{ transaction.transferType }}
      </p>
    </template>

    <template #amount-data>
      <div class="flex items-center space-x-2">
        <span class="font-mono">
          <AppAmount
            v-bind="{
              amount: transaction.amount.toFixed(),
              decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
            }"
        /></span>

        <span class="font-semibold text-coolGray-500">
          {{ transaction.transaction.token.symbol }}
        </span>
      </div>
    </template>

    <template #origin-data>
      <p class="text-white font-mono">
        <PartialsWalletHistoryCommonAddress
          is-xs
          :address="transaction.transaction.sender"
        >
          {{ transaction.formattedOrigin }}
        </PartialsWalletHistoryCommonAddress>
      </p>
    </template>

    <template #destination-data>
      <p class="text-white font-mono">
        {{ transaction.formattedDestination }}
      </p>
    </template>
  </AppMobileTable>
</template>
