<script setup lang="ts">
import { usdtToken } from '@shared/data/token'
import { FundingHistoryTableColumn } from '@/types'
import type { UTableColumn, TransformedFundingHistory } from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    fundingHistory: TransformedFundingHistory
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === FundingHistoryTableColumn.Pair) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)
</script>

<template>
  <AppMobileTable
    :columns="filteredColumns"
    grid-class="grid gap-6 grid-cols-2"
  >
    <template #header>
      <div class="flex items-center space-x-2 font-sans mb-6">
        <CommonTokenIcon
          v-bind="{ token: fundingHistory.market.baseToken }"
          :is-sm="true"
        />
        <p class="text-sm text-coolGray-200">
          {{ fundingHistory.market.ticker }}
        </p>
      </div>
    </template>

    <template #time-data>
      <p>{{ fundingHistory.time }}</p>
    </template>

    <template #payment-data>
      <div class="text-right space-x-2 flex justify-end">
        <span
          class="inline-block"
          :class="{
            'text-green-500': fundingHistory.total.gte(0),
            'text-red-500': fundingHistory.total.lt(0)
          }"
        >
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              decimals: usdtToken.decimals,
              amount: fundingHistory.total.toFixed()
            }"
          />
        </span>

        <span class="text-coolGray-500">
          {{ fundingHistory.market.quoteToken.symbol }}
        </span>
      </div>
    </template>
  </AppMobileTable>
</template>
