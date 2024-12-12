<script setup lang="ts">
import {
  UTableColumn,
  SpotMarketCyTags,
  TransformedPortfolioSpotOpenOrders,
  PortfolioSpotOpenOrdersTableColumn
} from '@/types'

const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    order: TransformedPortfolioSpotOpenOrders
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const removedKey = [
      PortfolioSpotOpenOrdersTableColumn.Chase,
      PortfolioSpotOpenOrdersTableColumn.Market
    ]

    if (removedKey.includes(column.key as PortfolioSpotOpenOrdersTableColumn)) {
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
      <div class="flex items-start flex-wrap gap-2 mb-6 justify-between">
        <PartialsCommonMarketRedirection
          class="flex items-center space-x-2 font-sans"
          v-bind="{ market: order.market }"
        >
          <CommonTokenIcon
            v-bind="{ token: order.market.baseToken }"
            :is-sm="true"
          />
          <p
            class="text-sm text-coolGray-200"
            :data-cy="`${dataCyTag(SpotMarketCyTags.OpenOrderMarketTicker)}-${
              order.market.ticker
            }`"
          >
            {{ order.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>

        <div class="flex space-x-2">
          <PartialsPortfolioOrdersSpotOpenOrdersTableChase
            v-bind="{
              order: order.order,
              isBuy: order.isBuy,
              market: order.market,
              isDisabled:
                !sharedWalletStore.isAutoSignEnabled ||
                order.insufficientBalance
            }"
          />

          <PartialsPortfolioOrdersSpotOpenOrdersTableCancelOrder
            v-if="order.orderFillable"
            v-bind="{
              order: order.order,
              isAuthorized: order.isAuthorized
            }"
          />
        </div>
      </div>
    </template>

    <template #side-data>
      <span
        class="font-sans"
        :class="{
          'text-green-500': order.isBuy,
          'text-red-500': !order.isBuy
        }"
        :data-cy="`${dataCyTag(SpotMarketCyTags.OpenOrderSide)}-${
          order.order.orderSide
        }`"
      >
        {{ $t('trade.' + order.order.orderSide) }}
      </span>
    </template>

    <template #price-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderPrice)">
        <AppAmount
          v-bind="{
            amount: order.price.toFixed(),
            decimalPlaces: order.priceDecimals
          }"
          class="font-mono"
        />
      </div>
    </template>

    <template #amount-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderQty)">
        <AppAmount
          v-bind="{
            amount: order.quantity.toFixed(),
            decimalPlaces: order.quantityDecimals
          }"
          class="font-mono"
        />
      </div>
    </template>

    <template #unfilled-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderUnfilledQty)">
        <AppAmount
          v-bind="{
            decimalPlaces: order.quantityDecimals,
            amount: order.unfilledQuantity.toFixed()
          }"
          class="font-mono"
        />
      </div>
    </template>

    <template #filled-data>
      <div class="flex flex-col">
        <p
          :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderFilledQty)"
          class="flex gap-1"
        >
          <AppAmount
            v-bind="{
              decimalPlaces: order.quantityDecimals,
              amount: order.filledQuantity.toFixed()
            }"
            class="font-mono"
          />
        </p>
        <p class="text-coolGray-500 font-mono">
          {{ order.filledQuantityPercentageToFormat }}%
        </p>
      </div>
    </template>

    <template #total-amount-data>
      <p :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderTotalAmt)">
        <AppAmount
          v-bind="{
            amount: order.total.toFixed(),
            decimalPlaces: order.priceDecimals
          }"
          class="font-mono"
        />
        <span
          class="text-coolGray-500 ml-1"
          :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderTotalAmtTokenSymbol)"
        >
          {{ order.market.quoteToken.symbol }}
        </span>
      </p>
    </template>
  </AppMobileTable>
</template>
