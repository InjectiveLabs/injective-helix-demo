<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import {
  PerpetualMarketCyTags,
  PortfolioFuturesTradeHistoryTableColumn
} from '@/types'
import type {
  UTableColumn,
  TransformedPortfolioFuturesTradeHistory
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
      <PartialsCommonMarketRedirection
        class="flex items-center space-x-2 font-sans mb-6"
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
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: trade.price.toFixed(),
            decimals: trade.priceDecimals
          }"
        />
      </div>
    </template>

    <template #amount-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryAmount)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: trade.quantity.toFixed(),
            decimals: trade.quantityDecimals
          }"
        />
      </div>
    </template>

    <template #fee-data>
      <div class="flex items-center">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryFee)">
          <SharedAmount
            v-bind="{
              amount: trade.fee.toFixed()
            }"
          />
        </span>
        <span class="ml-1 text-coolGray-500">
          {{ trade.market.quoteToken.symbol }}
        </span>
      </div>
    </template>

    <template #pnl-data>
      <div
        class="flex items-center"
        :class="{
          'text-red-500': trade.pnl.lt(0),
          'text-green-500': trade.pnl.gt(0)
        }"
      >
        <SharedAmount
          v-bind="{
            useSubscript: true,
            showZeroAsEmDash: true,
            shouldAbbreviate: false,
            amount: trade.pnl.toFixed()
          }"
        />
        <span v-if="!trade.pnl.isZero()" class="ml-1 text-coolGray-500">
          {{ trade.market.quoteToken.symbol }}
        </span>
      </div>
    </template>

    <template #total-data>
      <div class="flex">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTotal)">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: trade.total.toFixed(),
              decimals: trade.priceDecimals
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
