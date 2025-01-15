<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { TradeDirection } from '@injectivelabs/sdk-ts'
import { SharedUiDerivativeTrade } from '@shared/types'
import {
  LOW_FEE_AMOUNT_THRESHOLD,
  UI_DEFAULT_FEE_MIN_DECIMALS,
  UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import {
  PerpetualMarketCyTags,
  PortfolioFuturesTradeHistoryTableColumn
} from '@/types'

const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{ trades: SharedUiDerivativeTrade[] }>(),
  {}
)

const { rows } = useFuturesTradeHistoryTransformer(computed(() => props.trades))

const columns = [
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Time,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Time}`
    ),
    class: 'w-[14%]'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Market,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Market}`
    ),
    class: 'w-[14%]'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Type,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Type}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Side,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Side}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Price,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Price}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Amount,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Amount}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Fee,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Fee}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesTradeHistoryTableColumn.Total,
    label: t(
      `portfolio.table.futuresTradeHistory.${PortfolioFuturesTradeHistoryTableColumn.Total}`
    ),
    class: 'text-right'
  }
]
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #time-data="{ row }">
        <div
          class="flex items-center p-2"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTimestamp)"
        >
          {{ row.time }}
        </div>
      </template>

      <template #market-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center space-x-2 p-2 font-sans"
        >
          <CommonTokenIcon v-bind="{ token: row.market.baseToken }" />
          <p
            :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryMarketTicker)"
          >
            {{ row.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>
      </template>

      <template #type-data="{ row }">
        <div class="flex items-center p-2">
          <span
            class="font-sans"
            :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTradeType)"
          >
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTradeSide)"
        >
          {{ $t(`trade.${row.trade.tradeDirection}`) }}
        </div>
      </template>

      <template #price-data="{ row }">
        <div
          class="flex items-center justify-end p-2"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryPrice)"
        >
          <AppAmount
            v-bind="{
              amount: row.price.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
          />
        </div>
      </template>

      <template #amount-data="{ row }">
        <div
          class="flex items-center justify-end p-2"
          :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryAmount)"
        >
          <AppAmount
            v-bind="{
              amount: row.quantity.toFixed(),
              decimalPlaces: row.quantityDecimals
            }"
          />
        </div>
      </template>

      <template #fee-data="{ row }">
        <div class="flex-1 flex items-center justify-end p-2">
          <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryFee)">
            <AppAmount
              v-bind="{
                amount: row.fee.toFixed(),
                decimalPlaces: row.fee.abs().lt(LOW_FEE_AMOUNT_THRESHOLD)
                  ? UI_DEFAULT_FEE_MIN_DECIMALS
                  : UI_DEFAULT_AMOUNT_DISPLAY_DECIMALS
              }"
            />
          </span>
          <span class="ml-1 text-coolGray-500">
            {{ row.market.quoteToken.symbol }}
          </span>
        </div>
      </template>

      <template #total-data="{ row }">
        <div class="flex justify-end pr-2">
          <span :data-cy="dataCyTag(PerpetualMarketCyTags.TradeHistoryTotal)">
            <AppAmount
              v-bind="{
                amount: row.total.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
            />
          </span>
          <span class="ml-1 text-coolGray-500">
            {{ row.market?.quoteToken.symbol }}
          </span>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersFuturesTradeHistoryMobileTable
      v-for="trade in rows"
      :key="`${trade.trade.orderHash}-${trade.trade.tradeId}`"
      v-bind="{ trade, columns }"
    />
  </template>
</template>
