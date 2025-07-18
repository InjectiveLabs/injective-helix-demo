<script setup lang="ts">
import {
  PerpetualMarketCyTags,
  PortfolioFuturesOrderHistoryTableColumn
} from '@/types'
import type {
  UTableColumn,
  TransformedPortfolioFuturesOrderHistory
} from '@/types'

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    order: TransformedPortfolioFuturesOrderHistory
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === PortfolioFuturesOrderHistoryTableColumn.Market) {
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryMarketTicker)"
        >
          {{ order.market.ticker }}
        </p>
      </PartialsCommonMarketRedirection>
    </template>

    <template #last-updated-data>
      <div
        class="font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryTimeStamp)"
      >
        {{ order.timestamp }}
      </div>
    </template>

    <template #type-data>
      <span
        class="font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryOrderType)"
      >
        {{ order.type }}
      </span>
    </template>

    <template #side-data>
      <p
        class="font-sans"
        :class="{
          'text-green-500': order.isBuy,
          'text-red-500': !order.isBuy
        }"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistorySide)"
      >
        {{ $t(`trade.${order.isBuy ? 'buy' : 'sell'}`) }}
      </p>

      <p v-if="order.isReduceOnly" class="text-coolGray-400">
        {{ $t('trade.reduce_only') }}
      </p>
    </template>

    <template #price-data>
      <span v-if="order.isMarketOrder" class="font-sans">
        {{ $t('trade.market') }}
      </span>

      <span
        v-else
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryPrice)"
      >
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: order.price.toFixed(),
            decimals: order.priceDecimals
          }"
        />
      </span>
    </template>

    <template #amount-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryAmount)">
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
      <div class="flex items-center">
        <span :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryTotal)">
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: order.total.toFixed(),
              decimals: order.priceDecimals
            }"
          />
        </span>

        <span class="text-coolGray-500 ml-1">
          {{ order.market?.quoteToken.symbol }}
        </span>
      </div>
    </template>

    <template #trigger-condition-data>
      <div
        :class="{ 'flex-col': order.order.isConditional }"
        class="flex gap-1"
      >
        <template v-if="order.order.isConditional">
          <span class="text-coolGray-500 font-semibold">
            {{ $t('trade.markPrice') }}
          </span>

          <div class="flex gap-1">
            <span
              v-if="
                (order.isStopLoss && !order.isBuy) ||
                (order.isTakeProfit && order.isBuy)
              "
            >
              <span class="text-white font-semibold">&le;</span>
            </span>
            <span v-else class="text-white font-semibold">&ge;</span>

            <SharedAmount
              v-bind="{
                useSubscript: true,
                shouldAbbreviate: false,
                decimals: order.priceDecimals,
                amount: order.triggerPrice.toFixed()
              }"
            />
          </div>
        </template>

        <template v-else>
          <span>&mdash;</span>
        </template>
      </div>
    </template>

    <template #status-data>
      <span
        class="font-sans"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OrderHistoryOrderStatus)"
      >
        {{ order.orderStatus }}
      </span>
    </template>
  </AppMobileTable>
</template>
