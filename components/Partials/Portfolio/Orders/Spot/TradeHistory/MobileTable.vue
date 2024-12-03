<script setup lang="ts">
import { TradeDirection } from '@injectivelabs/sdk-ts'
import {
  LOW_FEE_AMOUNT_THRESHOLD,
  UI_DEFAULT_FEE_MIN_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  UTableColumn,
  TransformedPortfolioSpotTradeHistory,
  PortfolioSpotTradeHistoryTableColumn
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    trade: TransformedPortfolioSpotTradeHistory
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === PortfolioSpotTradeHistoryTableColumn.Pair) {
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
      <PartialsCommonMarketRedirection
        class="flex items-center space-x-2 font-sans mb-6"
        v-bind="{ market: trade.market }"
      >
        <CommonTokenIcon
          v-bind="{ token: trade.market.baseToken }"
          :is-sm="true"
        />
        <p class="text-sm text-coolGray-200">
          {{ trade.market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>
    </template>

    <template #time-data>
      <div class="font-sans">{{ trade.time }}</div>
    </template>

    <template #type-data>
      <span class="font-sans">
        {{ trade.tradeExecutionType }}
      </span>
    </template>

    <template #side-data>
      <div
        class="font-sans"
        :class="{
          'text-green-500': trade.trade.tradeDirection === TradeDirection.Buy,
          'text-red-500': trade.trade.tradeDirection === TradeDirection.Sell
        }"
      >
        {{ $t(`trade.${trade.trade.tradeDirection}`) }}
      </div>
    </template>

    <template #price-data>
      <AppAmount
        v-bind="{
          amount: trade.price.toFixed(),
          decimalPlaces: trade.priceDecimals
        }"
      />
    </template>

    <template #amount-data>
      <AppAmount
        v-bind="{
          amount: trade.quantity.toFixed(),
          decimalPlaces: trade.quantityDecimals
        }"
      />
    </template>

    <template #fee-data>
      <p class="flex">
        <AppAmount
          v-bind="{
            amount: trade.fee.toFixed(),
            decimalPlaces: trade.fee.abs().lt(LOW_FEE_AMOUNT_THRESHOLD)
              ? UI_DEFAULT_FEE_MIN_DECIMALS
              : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          }"
        />
        <span class="ml-1 text-coolGray-500">
          {{ trade.market?.quoteToken.symbol }}
        </span>
      </p>
    </template>

    <template #total-data>
      <div class="flex">
        <AppAmount
          v-bind="{
            amount: trade.total.toFixed(),
            decimalPlaces: UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
          }"
        />
        <span class="ml-1 text-coolGray-500">
          {{ trade.market?.quoteToken.symbol }}
        </span>
      </div>
    </template>
  </AppMobileTable>
</template>
