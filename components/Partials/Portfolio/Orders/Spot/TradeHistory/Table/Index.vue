<script setup lang="ts">
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { PortfolioSpotTradeHistoryTableColumn } from '@/types'
import type { SharedUiSpotTrade } from '@shared/types'

const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(defineProps<{ trades: SharedUiSpotTrade[] }>(), {})

const { rows } = useSpotTradeHistoryTransformer(computed(() => props.trades))

const columns = computed(() => [
  {
    key: PortfolioSpotTradeHistoryTableColumn.Time,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Time}`
    ),
    class: 'w-[14%]'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Pair,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Pair}`
    ),
    class: 'w-[14%]'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Type,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Type}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Side,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Side}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Price,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Price}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Amount,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Amount}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Fee,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Fee}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioSpotTradeHistoryTableColumn.Total,
    label: t(
      `portfolio.table.spotTradeHistory.${PortfolioSpotTradeHistoryTableColumn.Total}`
    ),
    class: 'text-right'
  }
])
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #time-data="{ row }">
        <div class="flex items-center p-2 font-sans">{{ row.time }}</div>
      </template>

      <template #pair-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center space-x-2 p-2 font-sans"
        >
          <CommonTokenIcon v-bind="{ token: row.market.baseToken }" />
          <p>{{ row.market.ticker }}</p>
        </PartialsCommonMarketRedirection>
      </template>

      <template #type-data="{ row }">
        <div class="flex items-center p-2">
          <span class="font-sans">
            {{ row.tradeExecutionType }}
          </span>
        </div>
      </template>

      <template #side-data="{ row }">
        <div
          class="flex items-center p-2 font-sans"
          :class="{
            'text-green-500': row.trade.tradeDirection === TradeDirection.Buy,
            'text-red-500': row.trade.tradeDirection === TradeDirection.Sell
          }"
        >
          {{ $t(`trade.${row.trade.tradeDirection}`) }}
        </div>
      </template>

      <template #price-data="{ row }">
        <div class="flex items-center justify-end p-2">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: row.price.toFixed(),
              decimals: row.priceDecimals
            }"
          />
        </div>
      </template>

      <template #amount-data="{ row }">
        <div class="flex items-center justify-end p-2">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: row.quantity.toFixed(),
              decimals: row.quantityDecimals
            }"
          />
        </div>
      </template>

      <template #fee-data="{ row }">
        <div class="flex-1 flex items-center justify-end p-2">
          <p class="flex">
            <SharedAmount
              v-bind="{
                amount: row.fee.toFixed()
              }"
            />
            <span class="ml-1 text-coolGray-500">
              {{ row.market?.quoteToken.symbol }}
            </span>
          </p>
        </div>
      </template>

      <template #total-data="{ row }">
        <div class="flex justify-end pr-2">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: row.total.toFixed()
            }"
          />
          <span class="ml-1 text-coolGray-500">
            {{ row.market?.quoteToken.symbol }}
          </span>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersSpotTradeHistoryMobileTable
      v-for="trade in rows"
      :key="`${trade.trade.orderHash}-${trade.trade.tradeId}`"
      v-bind="{ trade, columns }"
    />
  </template>
</template>
