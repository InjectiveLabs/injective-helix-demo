<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotOrderHistory } from '@injectivelabs/sdk-ts'
import { SpotMarketCyTags, PortfolioSpotOrderHistoryTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()

const props = withDefaults(defineProps<{ orders: SpotOrderHistory[] }>(), {})

const { rows } = useSpotOrderHistoryTransformer(computed(() => props.orders))

const columns = [
  {
    key: PortfolioSpotOrderHistoryTableColumn.LastUpdated,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.LastUpdated}`
    ),
    class: 'w-[13%]'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Market,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Market}`
    ),
    class: 'w-[13%]'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Type,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Type}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Side,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Side}`
    ),
    class: 'w-[7%]'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Price,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Price}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Amount,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Amount}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Total,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Total}`
    ),
    class: 'text-right'
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.TriggerCondition,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.TriggerCondition}`
    )
  },
  {
    key: PortfolioSpotOrderHistoryTableColumn.Status,
    label: t(
      `portfolio.table.spotOrderHistory.${PortfolioSpotOrderHistoryTableColumn.Status}`
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
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTimestamp)"
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
          <p :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryMarketTicker)">
            {{ row.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>
      </template>

      <template #type-data="{ row }">
        <div
          class="flex items-center p-2 font-sans"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryType)"
        >
          {{ row.type }}
        </div>
      </template>

      <template #side-data="{ row }">
        <div class="flex items-center p-2">
          <span
            :class="{
              'text-green-500': row.isBuy,
              'text-red-500': !row.isBuy
            }"
            class="font-sans"
            :data-cy="`${dataCyTag(SpotMarketCyTags.OrderHistorySide)}-${
              row.order.direction
            }`"
          >
            {{ $t(`trade.${row.order.direction}`) }}
          </span>
        </div>
      </template>

      <template #price-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryPrice)"
        >
          <AppAmount
            v-bind="{
              amount: row.price.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
            class="font-mono"
          />
        </div>
      </template>

      <template #amount-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryAmount)"
        >
          <AppAmount
            v-bind="{
              amount: row.quantity.toFixed(),
              decimalPlaces: row.quantityDecimals
            }"
            class="font-mono"
          />
        </div>
      </template>

      <template #total-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTotal)"
        >
          <AppAmount
            v-bind="{
              amount: row.total.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
            class="font-mono"
          />
          <span class="text-coolGray-500 ml-1">
            {{ row.market?.quoteToken.symbol }}
          </span>
        </div>
      </template>

      <template #trigger-condition-data="{ row }">
        <div class="flex justify-center items-center p-2">
          <span v-if="row.triggerPrice.eq(0)"> &mdash; </span>
          <span
            v-else
            :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTrigger)"
          >
            <AppAmount
              v-bind="{
                amount: row.triggerPrice.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
              class="font-mono"
            />
          </span>
        </div>
      </template>

      <template #status-data="{ row }">
        <div
          class="flex items-center p-2 font-sans"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryStatus)"
        >
          {{ row.orderStatus }}
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersSpotOrderHistoryMobileTable
      v-for="order in rows"
      :key="`${order.order.cid}-${order.order.orderHash}`"
      v-bind="{ order, columns }"
    />
  </template>
</template>
