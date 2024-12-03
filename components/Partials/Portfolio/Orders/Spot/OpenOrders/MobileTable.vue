<script setup lang="ts">
import { Status } from '@injectivelabs/utils'
import {
  UTableColumn,
  SpotMarketCyTags,
  TransformedPortfolioSpotOpenOrders,
  PortfolioSpotOpenOrdersTableColumn
} from '@/types'

const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    status: Status
    chaseStatus: Status
    columns: UTableColumn[]
    order: TransformedPortfolioSpotOpenOrders
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
      PortfolioSpotOpenOrdersTableColumn.Market,
      PortfolioSpotOpenOrdersTableColumn.Chase
    ]

    if (removedKey.includes(column.key as PortfolioSpotOpenOrdersTableColumn)) {
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
            v-if="order.orderFillable"
            size="sm"
            class="py-2"
            variant="danger"
            :status="status"
            :disabled="!order.isAuthorized"
            :tooltip="order.isAuthorized ? '' : $t('common.unauthorized')"
            :data-cy="dataCyTag(SpotMarketCyTags.CancelOrderButton)"
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
          />
        </p>
        <p class="text-coolGray-500">
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
