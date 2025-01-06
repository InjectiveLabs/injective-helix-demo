<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { SpotLimitOrder } from '@injectivelabs/sdk-ts'
import {
  SpotMarketCyTags,
  PortfolioSubPage,
  PortfolioSpotOpenOrdersTableColumn
} from '@/types'

const { t } = useLang()
const { lg, xl } = useTwBreakpoints()
const { activeSubaccountBalancesWithToken } = useBalance()
const sharedWalletStore = useSharedWalletStore()

const props = withDefaults(
  defineProps<{
    isTradingBots?: boolean
    orders: SpotLimitOrder[]
  }>(),
  {}
)

const { rows } = useSpotOpenOrdersTransformer(
  computed(() => props.orders),
  activeSubaccountBalancesWithToken
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
    }
  ]

  if (!props.isTradingBots) {
    baseColumns.push({
      key: PortfolioSpotOpenOrdersTableColumn.Chase,
      label: t(
        `portfolio.table.spotOpenOrder.${PortfolioSpotOpenOrdersTableColumn.Chase}`
      ),
      class: 'text-center'
    })
  }

  if (xl.value && !props.isTradingBots) {
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

          <PartialsPortfolioOrdersSpotOpenOrdersTableCancelOrder
            v-if="row.orderFillable && !xl && !isTradingBots"
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
          />
        </div>
      </template>

      <template #filled-data="{ row }">
        <div class="flex flex-col items-end p-2 justify-center">
          <div>
            <p
              :data-cy="dataCyTag(SpotMarketCyTags.OpenOrderFilledQty)"
              class="flex gap-1"
            >
              <AppAmount
                v-bind="{
                  decimalPlaces: row.quantityDecimals,
                  amount: row.filledQuantity.toFixed()
                }"
              />
            </p>
            <p class="text-coolGray-500">
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
          <PartialsPortfolioOrdersSpotOpenOrdersTableChase
            v-bind="{
              order: row.order,
              isBuy: row.isBuy,
              market: row.market,
              isDisabled:
                !sharedWalletStore.isAutoSignEnabled || row.insufficientBalance
            }"
          />
        </div>
      </template>

      <template #action-data="{ row }">
        <div v-if="row.orderFillable" class="p-2 flex justify-center">
          <PartialsPortfolioOrdersSpotOpenOrdersTableCancelOrder
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
    <PartialsPortfolioOrdersSpotOpenOrdersMobileTable
      v-for="order in rows"
      :key="order.order.orderHash"
      v-bind="{ order, columns, isTradingBots }"
    />
  </template>
</template>
