<script setup lang="ts">
import { USDT_DECIMALS } from '@/app/utils/constants'
import {
  UTableColumn,
  TransformedFundingPayment,
  FundingPaymentsTableColumn
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    fundingPayment: TransformedFundingPayment
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === FundingPaymentsTableColumn.Pair) {
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
          v-bind="{ token: fundingPayment.market.baseToken }"
          :is-sm="true"
        />
        <p class="text-sm text-coolGray-200">
          {{ fundingPayment.market.ticker }}
        </p>
      </div>
    </template>

    <template #time-data>
      <p>{{ fundingPayment.time }}</p>
    </template>

    <template #payment-data>
      <div class="text-right space-x-2 flex justify-end">
        <span
          class="inline-block"
          :class="{
            'text-green-500': fundingPayment.total.gte(0),
            'text-red-500': fundingPayment.total.lt(0)
          }"
        >
          <AppAmount
            v-bind="{
              amount: fundingPayment.total.toFixed(),
              decimalPlaces: USDT_DECIMALS
            }"
            class="font-mono"
          />
        </span>

        <span class="text-coolGray-500">
          {{ fundingPayment.market.quoteToken.symbol }}
        </span>
      </div>
    </template>
  </AppMobileTable>
</template>
