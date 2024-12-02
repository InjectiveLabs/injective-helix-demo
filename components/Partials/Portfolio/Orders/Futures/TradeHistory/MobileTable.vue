<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import {
  LOW_FEE_AMOUNT_THRESHOLD,
  UI_DEFAULT_FEE_MIN_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  UTableColumn,
  PerpetualMarketCyTags,
  TransformedPortfolioFuturesTradeHistory,
  PortfolioFuturesTradeHistoryTableColumn
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    trade: TransformedPortfolioFuturesTradeHistory
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === PortfolioFuturesTradeHistoryTableColumn.Market) {
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
            $t(
              `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Market}`
            )
          }}
        </p>

        <PartialsCommonMarketRedirection
          class="flex items-center space-x-2 font-sans"
          v-bind="{ market: trade.market }"
        >
          <CommonTokenIcon
            v-bind="{ token: trade.market.baseToken }"
            :is-sm="true"
          />
          <p
            class="text-sm text-coolGray-200"
            :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryMarketTicker)"
          >
            {{ trade.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>
      </div>
    </template>

    <template #time-data>
      <div
        class="font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTimestamp)"
      >
        {{ trade.time }}
      </div>
    </template>

    <template #type-data>
      <span
        class="font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTradeType)"
      >
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
        :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTradeSide)"
      >
        {{ $t(`trade.${trade.trade.tradeDirection}`) }}
      </div>
    </template>

    <template #price-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryPrice)">
        <AppAmount
          v-bind="{
            amount: trade.price.toFixed(),
            decimalPlaces: trade.priceDecimals
          }"
        />
      </div>
    </template>

    <template #amount-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryAmount)">
        <AppAmount
          v-bind="{
            amount: trade.quantity.toFixed(),
            decimalPlaces: trade.quantityDecimals
          }"
        />
      </div>
    </template>

    <template #fee-data>
      <div class="flex items-center">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryFee)">
          <AppAmount
            v-bind="{
              amount: trade.fee.toFixed(),
              decimalPlaces: trade.fee.abs().lt(LOW_FEE_AMOUNT_THRESHOLD)
                ? UI_DEFAULT_FEE_MIN_DECIMALS
                : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
            }"
          />
        </span>
        <span class="ml-1 text-coolGray-500">
          {{ trade.market.quoteToken.symbol }}
        </span>
      </div>
    </template>

    <template #total-data>
      <div class="flex">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTotal)">
          <AppAmount
            v-bind="{
              amount: trade.total.toFixed(),
              decimalPlaces: trade.priceDecimals
            }"
          />
        </span>
        <span class="ml-1 text-coolGray-500">
          {{ trade.market?.quoteToken.symbol }}
        </span>
      </div>
    </template>
  </AppMobileTable>
</template>
