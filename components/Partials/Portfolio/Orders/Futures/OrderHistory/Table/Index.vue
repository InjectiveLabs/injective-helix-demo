<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import {
  PerpetualMarketCyTags,
  PortfolioFuturesOrderHistoryTableColumn
} from '@/types'

const { t } = useLang()
const { lg } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{ orders: DerivativeOrderHistory[] }>(),
  {}
)

const { rows } = useFuturesOrderHistoryTransformer(computed(() => props.orders))

const columns = [
  {
    key: PortfolioFuturesOrderHistoryTableColumn.LastUpdated,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.LastUpdated}`
    ),
    class: 'w-[12%]'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Market,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Market}`
    ),
    class: 'w-[12%]'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Type,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Type}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Side,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Side}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Price,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Price}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Amount,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Amount}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Total,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Total}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.TriggerCondition,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.TriggerCondition}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioFuturesOrderHistoryTableColumn.Status,
    label: t(
      `portfolio.table.futuresOrderHistory.${PortfolioFuturesOrderHistoryTableColumn.Status}`
    )
  }
]
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #last-updated-data="{ row }">
        <div
          class="flex items-center p-2 font-sans"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryTimeStamp)"
        >
          {{ row.timestamp }}
        </div>
      </template>

      <template #market-data="{ row }">
        <PartialsCommonMarketRedirection
          :market="row.market"
          class="flex items-center space-x-2 p-2 font-sans"
        >
          <CommonTokenIcon v-bind="{ token: row.market.baseToken }" />
          <p
            :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryMarketTicker)"
          >
            {{ row.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>
      </template>

      <template #type-data="{ row }">
        <div class="flex items-center p-2">
          <span
            class="font-sans"
            :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryOrderType)"
          >
            {{ row.type }}
          </span>
        </div>
      </template>

      <template #side-data="{ row }">
        <div class="flex items-center p-2">
          <div>
            <p
              class="font-sans"
              :class="{
                'text-green-500': row.isBuy,
                'text-red-500': !row.isBuy
              }"
              :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistorySide)"
            >
              {{ $t(`trade.${row.isBuy ? 'buy' : 'sell'}`) }}
            </p>

            <p v-if="row.isReduceOnly" class="text-coolGray-400">
              {{ $t('trade.reduce_only') }}
            </p>
          </div>
        </div>
      </template>

      <template #price-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <span v-if="row.isMarketOrder" class="font-sans">
            {{ $t('trade.market') }}
          </span>

          <span
            v-else
            :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryPrice)"
          >
            <AppAmount
              v-bind="{
                amount: row.price.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
            />
          </span>
        </div>
      </template>

      <template #amount-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryAmount)"
        >
          <AppAmount
            v-bind="{
              amount: row.quantity.toFixed(),
              decimalPlaces: row.quantityDecimals
            }"
          />
        </div>
      </template>

      <template #total-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <span :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryTotal)">
            <AppAmount
              v-bind="{
                amount: row.total.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
            />
          </span>

          <span class="text-coolGray-500 ml-1">
            {{ row.market?.quoteToken.symbol }}
          </span>
        </div>
      </template>

      <template #trigger-condition-data="{ row }">
        <div
          :class="[
            row.order.isConditional
              ? 'flex-col items-end'
              : 'justify-end items-center'
          ]"
          class="flex-1 flex p-2 justify-end gap-2"
        >
          <template v-if="row.order.isConditional">
            <span class="text-coolGray-500 font-semibold">
              {{ $t('trade.mark_price') }}
            </span>

            <div class="flex gap-2">
              <span
                v-if="
                  (row.isStopLoss && !row.isBuy) ||
                  (row.isTakeProfit && row.isBuy)
                "
              >
                <span class="text-white font-semibold">&le;</span>
              </span>
              <span v-else class="text-white font-semibold">&ge;</span>

              <AppAmount
                v-bind="{
                  decimalPlaces: row.priceDecimals,
                  amount: row.triggerPrice.toFixed()
                }"
              />
            </div>
          </template>

          <template v-else>
            <span>&mdash;</span>
          </template>
        </div>
      </template>

      <template #status-data="{ row }">
        <div class="flex items-center p-2 font-sans">
          <span
            :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryOrderStatus)"
          >
            {{ row.orderStatus }}
          </span>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersFuturesOrderHistoryMobileTable
      v-for="order in rows"
      :key="`${order.order.orderHash}-${order.order.cid}`"
      v-bind="{ order, columns }"
    />
  </template>
</template>
