<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { DerivativeLimitOrder } from '@injectivelabs/sdk-ts'
import {
  PortfolioSubPage,
  PerpetualMarketCyTags,
  PortfolioFuturesOpenOrdersTableColumn
} from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()
const breakpoints = useBreakpointsTw()
const { activeSubaccountBalancesWithToken } = useBalance()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{ orders: DerivativeLimitOrder[] }>(),
  {}
)

const { rows } = useFuturesOpenOrdersTransformer(
  computed(() => props.orders),
  activeSubaccountBalancesWithToken
)

const fourXl = breakpoints['4xl']

const columns = computed(() => {
  const baseColumns = [
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Market,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Market}`
      )
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Side,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Side}`
      )
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Price,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Price}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Amount,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Amount}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Unfilled,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Unfilled}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Filled,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Filled}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Leverage,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Leverage}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Total,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Total}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesOpenOrdersTableColumn.Chase,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Chase}`
      ),
      class: 'text-center'
    }
  ]

  if (fourXl.value) {
    baseColumns.push({
      key: PortfolioFuturesOpenOrdersTableColumn.Action,
      label: t(
        `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Action}`
      ),
      class: 'text-center'
    })
  }

  return baseColumns
})
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
                `portfolio.table.futuresOpenOrder.${PortfolioFuturesOpenOrdersTableColumn.Chase}`
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
              :data-cy="`${dataCyTag(
                PerpetualMarketCyTags.OpenOrdersMarketTicker
              )}-${row.market.ticker}`"
            >
              {{ row.market.ticker }}
            </p>
          </PartialsCommonMarketRedirection>

          <PartialsPortfolioOrdersFuturesOpenOrdersTableCancelOrder
            v-if="!fourXl"
            v-bind="{
              order: row.order,
              isAuthorized: row.isAuthorized
            }"
          />
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
            :data-cy="`${dataCyTag(PerpetualMarketCyTags.OpenOrdersSide)}-${
              row.order.orderSide
            }`"
          >
            {{ $t(`trade.${row.order.orderSide}`) }}
          </span>
        </div>
      </template>

      <template #price-data="{ row }">
        <div
          class="flex items-center p-2 justify-end"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersPrice)"
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersAmount)"
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
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersUnfilled)"
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
        <div
          class="flex flex-col items-end p-2 justify-center"
          :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersFilled)"
        >
          <AppAmount
            v-bind="{
              decimalPlaces: row.quantityDecimals,
              amount: row.filledQuantity.toFixed()
            }"
            class="font-mono"
          />
        </div>
      </template>

      <template #leverage-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <span
            v-if="row.leverage.isNaN()"
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
            {{ row.leverage.toFormat(2) }}&times;
          </span>
        </div>
      </template>

      <template #total-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <div class="space-y-1">
            <p :data-cy="dataCyTag(PerpetualMarketCyTags.OpenOrdersTotal)">
              <AppAmount
                v-bind="{
                  amount: row.total.toFixed(),
                  decimalPlaces: row.priceDecimals
                }"
                class="font-mono"
              />
              <span class="text-coolGray-500 ml-2">
                {{ row.market.quoteToken.symbol }}
              </span>
            </p>
          </div>
        </div>
      </template>

      <template #chase-data="{ row }">
        <div class="p-2 flex items-center justify-center">
          <PartialsPortfolioOrdersSpotOpenOrdersTableChase
            v-bind="{
              order: row.order,
              isBuy: row.isBuy,
              market: row.market,
              isDisabled:
                !sharedWalletStore.isAutoSignEnabled || row.insufficientBalance
            }"
            is-futures
          />
        </div>
      </template>

      <template #action-data="{ row }">
        <div class="p-2 flex justify-center">
          <PartialsPortfolioOrdersFuturesOpenOrdersTableCancelOrder
            v-bind="{
              order: row.order,
              isAuthorized: row.isAuthorized
            }"
          />
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersFuturesOpenOrdersMobileTable
      v-for="order in rows"
      :key="order.order.orderHash"
      v-bind="{ order, columns }"
    />
  </template>
</template>
