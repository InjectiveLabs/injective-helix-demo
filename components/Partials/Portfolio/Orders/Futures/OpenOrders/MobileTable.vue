<script setup lang="ts">
import { Status } from '@injectivelabs/utils'
import {
  UTableColumn,
  PerpetualMarketCyTags,
  TransformedPortfolioFuturesOpenOrders,
  PortfolioFuturesOpenOrdersTableColumn
} from '@/types'

const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    status: Status
    chaseStatus: Status
    columns: UTableColumn[]
    order: TransformedPortfolioFuturesOpenOrders
  }>(),
  {}
)

const emit = defineEmits<{
  'order:cancel': []
  'chase:click': []
}>()

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    const removedKey = [
      PortfolioFuturesOpenOrdersTableColumn.Market,
      PortfolioFuturesOpenOrdersTableColumn.Chase
    ]

    if (
      removedKey.includes(column.key as PortfolioFuturesOpenOrdersTableColumn)
    ) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)

function cancelOrder() {
  emit('order:cancel')
}

function chase() {
  emit('chase:click')
}
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
          <p class="text-sm text-coolGray-200">
            {{ order.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>

        <div class="flex space-x-2">
          <AppButton
            size="sm"
            class="py-2"
            :status="chaseStatus"
            :disabled="
              !sharedWalletStore.isAutoSignEnabled || order.insufficientBalance
            "
            @click="chase"
          >
            <span>{{ $t('trade.chase') }}</span>
          </AppButton>

          <AppButton
            size="sm"
            class="py-2"
            variant="danger"
            :status="status"
            :disabled="!order.isAuthorized"
            :tooltip="order.isAuthorized ? '' : $t('common.unauthorized')"
            @click="cancelOrder"
          >
            Cancel Order
          </AppButton>
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
        :data-cy="`${dataCyTag(PerpetualMarketCyTags.OpenOrdersSide)}-${
          order.order.orderSide
        }`"
      >
        {{ $t(`trade.${order.order.orderSide}`) }}
      </span>
    </template>

    <template #price-data>
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersPrice)">
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
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersAmount)">
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
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersUnfilled)">
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
      <div :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersFilled)">
        <AppAmount
          v-bind="{
            decimalPlaces: order.quantityDecimals,
            amount: order.filledQuantity.toFixed()
          }"
          class="font-mono"
        />
      </div>
    </template>

    <template #leverage-data>
      <span
        v-if="order.leverage.isNaN()"
        class="text-coolGray-400"
        :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersLeverageNa)"
      >
        {{ $t('trade.not_available_n_a') }}
      </span>
      <span
        v-else
        :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersLeverage)"
        class="font-mono"
      >
        {{ order.leverage.toFormat(2) }}&times;
      </span>
    </template>

    <template #total-data>
      <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersTotal)">
        <AppAmount
          v-bind="{
            amount: order.total.toFixed(),
            decimalPlaces: order.priceDecimals
          }"
          class="font-mono"
        />
        <span class="text-coolGray-500 ml-1">
          {{ order.market.quoteToken.symbol }}
        </span>
      </p>
    </template>
  </AppMobileTable>
</template>
