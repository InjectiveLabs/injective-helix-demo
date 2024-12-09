<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { NuxtUiIcons } from '@shared/types'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import { Status, StatusType, BigNumberInBase } from '@injectivelabs/utils'
import {
  UiSpotMarket,
  SpotMarketCyTags,
  PortfolioSubPage,
  PortfolioSpotOpenOrdersTableColumn
} from '@/types'

const { t } = useLang()
const spotStore = useSpotStore()
const { lg, xl } = useTwBreakpoints()
const { $onError } = useNuxtApp()
const orderbookStore = useOrderbookStore()
const { userBalancesWithToken } = useBalance()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()

const props = withDefaults(defineProps<{ orders: SpotLimitOrder[] }>(), {})

const { rows } = useSpotOpenOrdersTransformer(
  computed(() => props.orders),
  userBalancesWithToken
)

const columns = computed(() => {
  const baseColumns = [
    {
      key: PortfolioSpotOpenOrdersTableColumn.Market,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Market}`
      )
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.Side,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Side}`
      )
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.Price,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Price}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.Amount,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Amount}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.Unfilled,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Unfilled}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.Filled,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Filled}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.TotalAmount,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.TotalAmount}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioSpotOpenOrdersTableColumn.Chase,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Chase}`
      ),
      class: 'text-center'
    }
  ]

  if (xl.value) {
    baseColumns.push({
      key: PortfolioSpotOpenOrdersTableColumn.Action,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Action}`
      ),
      class: 'text-center'
    })
  }

  return baseColumns
})

const status = reactive(new Status(StatusType.Idle))
const chaseStatus = reactive(new Status(StatusType.Idle))

function chase(order: SpotLimitOrder, market: UiSpotMarket, isBuy: boolean) {
  const price = isBuy
    ? orderbookStore.buys[0]?.price
    : orderbookStore.sells[0]?.price

  if (!market || !price) {
    return
  }

  chaseStatus.setLoading()

  spotStore
    .submitChase({
      market: market as UiSpotMarket,
      order,
      price: new BigNumberInBase(price)
    })
    .then(() => {
      notificationStore.success({ title: t('trade.orderUpdated') })
    })
    .catch($onError)
    .finally(() => {
      chaseStatus.setIdle()
    })
}

function cancelOrder(order: SpotLimitOrder, isAuthorized: boolean) {
  if (!isAuthorized) {
    return
  }

  status.setLoading()

  spotStore
    .cancelOrder(order as SpotLimitOrder)
    .then(() => {
      notificationStore.success({ title: t('trade.order_success_canceling') })
    })
    .catch($onError)
    .finally(() => status.setIdle())
}
</script>

<template>
  <template v-if="lg">
    <UTable :rows="rows" :columns="columns">
      <template #chase-header>
        <NuxtLink
          :to="{ name: PortfolioSubPage.SettingsAutosign }"
          class="flex justify-center space-x-2 items-center"
        >
          <p>
            {{
              $t(
                `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Chase}`
              )
            }}
          </p>

          <AppTooltip v-bind="{ content: $t('trade.chaseTooltip') }" />
        </NuxtLink>
      </template>

      <template #market-data="{ row }">
        <div class="flex items-center gap-1">
          <PartialsCommonMarketRedirection
            :market="row.market"
            class="flex items-center space-x-2 p-2 font-sans"
          >
            <CommonTokenIcon :token="row.market.baseToken" />
            <p
              :data-cy="`${dataCyTag(SpotMarketCyTags.OpenOrderMarketTicker)}-${
                row.market.ticker
              }`"
            >
              {{ row.market.ticker }}
            </p>
          </PartialsCommonMarketRedirection>

          <AppButton
            v-if="row.orderFillable && !xl"
            size="xs"
            :status="status"
            variant="danger-shade"
            class="p-1 outline-none"
            :disabled="!row.isAuthorized"
            :title="$t('trade.cancelOrder')"
            :tooltip="row.isAuthorized ? '' : $t('common.unauthorized')"
            :data-cy="dataCyTag(SpotMarketCyTags.CancelOrderButton)"
            @click="cancelOrder(row.order, row.isAuthorized)"
          >
            <UIcon :name="NuxtUiIcons.Trash" class="size-4" />
          </AppButton>
        </div>
      </template>

      <template #side-data="{ row }">
        <div class="flex items-center p-2">
          <span
            class="font-sans"
            :class="{
              'text-green-500': row.isBuy,
              'text-red-500': !row.isBuy
            }"
            :data-cy="`${dataCyTag(SpotMarketCyTags.OpenOrderSide)}-${
              row.order.orderSide
            }`"
          >
            {{ $t('trade.' + row.order.orderSide) }}
          </span>
        </div>
      </template>

      <template #price-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderPrice)"
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
          :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderQty)"
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

      <template #unfilled-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderUnfilledQty)"
        >
          <AppAmount
            v-bind="{
              decimalPlaces: row.quantityDecimals,
              amount: row.unfilledQuantity.toFixed()
            }"
            class="font-mono"
          />
        </div>
      </template>

      <template #filled-data="{ row }">
        <div class="flex flex-col items-end p-2 justify-center">
          <div>
            <p
              :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderFilledQty)"
              class="flex gap-1 font-mono"
            >
              <AppAmount
                v-bind="{
                  decimalPlaces: row.quantityDecimals,
                  amount: row.filledQuantity.toFixed()
                }"
                class="font-mono"
              />
            </p>
            <p class="text-coolGray-500 font-mono">
              {{ row.filledQuantityPercentageToFormat }}%
            </p>
          </div>
        </div>
      </template>

      <template #total-amount-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <div class="space-y-1">
            <p :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderTotalAmt)">
              <AppAmount
                v-bind="{
                  amount: row.total.toFixed(),
                  decimalPlaces: row.priceDecimals
                }"
                class="font-mono"
              />
              <span
                class="text-coolGray-500 ml-1"
                :data-cy="
                  dataCyTag(SpotMarketCyTags.OpenOrderTotalAmtTokenSymbol)
                "
              >
                {{ row.market.quoteToken.symbol }}
              </span>
            </p>
          </div>
        </div>
      </template>

      <template #chase-data="{ row }">
        <div class="p-2 flex items-center justify-center">
          <button
            class="hover:underline text-green-500 font-semibold disabled:text-coolGray-600 disabled:cursor-not-allowed flex items-center space-x-1"
            :disabled="
              !sharedWalletStore.isAutoSignEnabled || row.insufficientBalance
            "
            @click="chase(row.order, row.market, row.isBuy)"
          >
            <span>{{ $t('trade.chase') }}</span>
            <AssetLogoSpinner
              v-if="chaseStatus.isLoading()"
              class="!w-4 !h-4"
            />
          </button>
        </div>
      </template>

      <template #action-data="{ row }">
        <div class="p-2 flex justify-center">
          <AppButton
            v-bind="{
              status,
              disabled: !row.isAuthorized,
              tooltip: row.isAuthorized ? '' : $t('common.unauthorized')
            }"
            size="sm"
            variant="danger-shade"
            class="min-w-16"
            :data-cy="dataCyTag(SpotMarketCyTags.CancelOrderButton)"
            @click="cancelOrder(row.order, row.isAuthorized)"
          >
            {{ $t('trade.cancelOrder') }}
          </AppButton>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersSpotOpenOrdersMobileTable
      v-for="order in rows"
      :key="order.order.orderHash"
      v-bind="{ order, columns, status, chaseStatus }"
      @order:cancel="cancelOrder(order.order, order.isAuthorized)"
      @chase:click="chase(order.order, order.market, order.isBuy)"
    />
  </template>
</template>
