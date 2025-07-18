<script setup lang="ts">
import { SpotMarketCyTags, PortfolioSpotOrderHistoryTableColumn } from '@/types'
import type {
  UTableColumn,
  TransformedPortfolioSpotOrderHistory
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    order: TransformedPortfolioSpotOrderHistory
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === PortfolioSpotOrderHistoryTableColumn.Market) {
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
        v-bind="{ market: order.market }"
      >
        <CommonTokenIcon
          v-bind="{ token: order.market.baseToken }"
          :is-sm="true"
        />
        <p
          class="text-sm text-coolGray-200"
          :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryMarketTicker)"
        >
          {{ order.market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>
    </template>

    <template #last-updated-data>
      <div
        class="font-sans"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTimestamp)"
      >
        {{ order.timestamp }}
      </div>
    </template>

    <template #type-data>
      <div
        class="font-sans"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryType)"
      >
        {{ order.type }}
      </div>
    </template>

    <template #side-data>
      <span
        :class="{
          'text-green-500': order.isBuy,
          'text-red-500': !order.isBuy
        }"
        class="font-sans"
        :data-cy="`${dataCyTag(SpotMarketCyTags.OrderHistorySide)}-${
          order.order.direction
        }`"
      >
        {{ $t(`trade.${order.order.direction}`) }}
      </span>
    </template>

    <template #price-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryPrice)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: order.price.toFixed(),
            decimals: order.priceDecimals
          }"
        />
      </div>
    </template>

    <template #amount-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryAmount)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: order.quantity.toFixed(),
            decimals: order.quantityDecimals
          }"
        />
      </div>
    </template>

    <template #total-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTotal)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: order.total.toFixed(),
            decimals: order.priceDecimals
          }"
        />
        <span class="text-coolGray-500 ml-1">
          {{ order.market?.quoteToken.symbol }}
        </span>
      </div>
    </template>

    <template #trigger-condition-data>
      <span v-if="order.triggerPrice.eq(0)"> &mdash; </span>
      <span v-else :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryTrigger)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: order.priceDecimals,
            amount: order.triggerPrice.toFixed()
          }"
        />
      </span>
    </template>

    <template #status-data>
      <div
        class="font-sans"
        :data-cy="dataCyTag(SpotMarketCyTags.OrderHistoryStatus)"
      >
        {{ order.orderStatus }}
      </div>
    </template>
  </AppMobileTable>
</template>
