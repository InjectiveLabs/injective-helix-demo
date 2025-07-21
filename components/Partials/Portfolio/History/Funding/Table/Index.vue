<script setup lang="ts">
import { usdtToken } from '@shared/data/token'
import { FundingHistoryTableColumn } from '@/types'
import type { FundingPayment } from '@injectivelabs/sdk-ts'

const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    fundingHistory: FundingPayment[]
  }>(),
  {}
)

const { rows } = useFundingHistoryTransformer(
  computed(() => props.fundingHistory)
)

const columns = computed(() => [
  {
    key: FundingHistoryTableColumn.Time,
    label: t(
      `portfolio.table.fundingHistory.${FundingHistoryTableColumn.Time}`
    ),
    class: 'w-1/5'
  },
  {
    key: FundingHistoryTableColumn.Pair,
    label: t(`portfolio.table.fundingHistory.${FundingHistoryTableColumn.Pair}`)
  },
  {
    key: FundingHistoryTableColumn.Payment,
    label: t(
      `portfolio.table.fundingHistory.${FundingHistoryTableColumn.Payment}`
    ),
    class: 'text-right'
  }
])
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #time-data="{ row }">
        <div class="p-2 flex items-center text-white">
          <div>{{ row.time }}</div>
        </div>
      </template>

      <template #pair-data="{ row }">
        <div class="p-2 flex items-center">
          <div class="flex space-x-2 items-center text-coolGray-200">
            <CommonTokenIcon
              v-if="row.market.baseToken"
              :token="row.market.baseToken"
            />
            <p>{{ row.market.ticker }}</p>
          </div>
        </div>
      </template>

      <template #payment-data="{ row }">
        <div class="p-2 text-right space-x-2 flex justify-end">
          <span
            class="inline-block"
            :class="{
              'text-green-500': row.total.gte(0),
              'text-red-500': row.total.lt(0)
            }"
          >
            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                amount: row.total.toFixed(),
                decimals: usdtToken.decimals
              }"
            />
          </span>

          <span class="text-coolGray-450">
            {{ row.market.quoteToken.symbol }}
          </span>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioHistoryFundingMobileTable
      v-for="fundingHistoryRow in rows"
      :key="`${fundingHistoryRow.total.toString()}-${
        fundingHistoryRow.market.marketId
      }-${fundingHistoryRow.time}`"
      v-bind="{ fundingHistory: fundingHistoryRow, columns }"
    />
  </template>
</template>
