<script setup lang="ts">
import { Wallet } from '@injectivelabs/wallet-base'
import { SpotMarketCyTags, PortfolioSpotOpenOrdersTableColumn } from '@/types'
import type { UTableColumn, TransformedPortfolioSpotOpenOrders } from '@/types'

const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    isTradingBots?: boolean
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
            v-if="
              !isTradingBots &&
              ![Wallet.Magic, Wallet.Turnkey].includes(sharedWalletStore.wallet)
            "
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
            v-if="order.orderFillable && !isTradingBots"
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
      <div :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderQty)">
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

    <template #unfilled-data>
      <div :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderUnfilledQty)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: order.quantityDecimals,
            amount: order.unfilledQuantity.toFixed()
          }"
        />
      </div>
    </template>

    <template #filled-data>
      <div class="flex flex-col">
        <p
          :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderFilledQty)"
          class="flex gap-1"
        >
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              decimals: order.quantityDecimals,
              amount: order.filledQuantity.toFixed()
            }"
          />
        </p>
        <p class="text-coolGray-500">
          {{ order.filledQuantityPercentageToFormat }}%
        </p>
      </div>
    </template>

    <template #total-amount-data>
      <p :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderTotalAmt)">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: order.total.toFixed(),
            decimals: order.priceDecimals
          }"
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
