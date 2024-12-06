<script setup lang="ts">
import { FundingPayment } from '@injectivelabs/sdk-ts'
import { USDT_DECIMALS } from '@/app/utils/constants'
import { FundingPaymentsTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    fundingPayments: FundingPayment[]
  }>(),
  {}
)

const { rows } = useFundingPaymentsTransformer(
  computed(() => props.fundingPayments)
)

const columns = [
  {
    key: FundingPaymentsTableColumn.Time,
    label: t(
      `activity.table.fundingPayments.${FundingPaymentsTableColumn.Time}`
    ),
    class: 'w-1/5'
  },
  {
    key: FundingPaymentsTableColumn.Pair,
    label: t(
      `activity.table.fundingPayments.${FundingPaymentsTableColumn.Pair}`
    )
  },
  {
    key: FundingPaymentsTableColumn.Payment,
    label: t(
      `activity.table.fundingPayments.${FundingPaymentsTableColumn.Payment}`
    ),
    class: 'text-right'
  }
]
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #time-data="{ row }">
        <div class="p-2 flex items-center">
          <div>{{ row.time }}</div>
        </div>
      </template>

      <template #pair-data="{ row }">
        <div class="p-2 flex items-center">
          <div class="flex space-x-2 items-center">
            <CommonTokenIcon
              v-if="row.market.baseToken"
              :token="row.market.baseToken"
            />
            <p class="font-semibold">{{ row.market.ticker }}</p>
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
            <AppAmount
              v-bind="{
                amount: row.total.toFixed(),
                decimalPlaces: USDT_DECIMALS
              }"
              class="font-mono"
            />
          </span>

          <span class="text-coolGray-500">
            {{ row.market.quoteToken.symbol }}
          </span>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioHistoryFundingMobileTable
      v-for="fundingPayment in rows"
      :key="`${fundingPayment.total.toString()}-${
        fundingPayment.market.marketId
      }-${fundingPayment.time}`"
      v-bind="{ fundingPayment, columns }"
    />
  </template>
</template>
