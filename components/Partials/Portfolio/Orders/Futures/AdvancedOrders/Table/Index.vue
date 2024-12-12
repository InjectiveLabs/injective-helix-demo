<script setup lang="ts">
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { PortfolioFuturesAdvancedOrdersTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()
const breakpoints = useBreakpointsTw()

const props = withDefaults(
  defineProps<{
    advancedOrders: DerivativeOrderHistory[]
  }>(),
  {}
)

const { rows } = useFuturesAdvancedOrdersTransformer(
  computed(() => props.advancedOrders)
)

const xxl = breakpoints['2xl']

const columns = computed(() => {
  const baseColumns = [
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Market,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Market}`
      ),
      class: 'w-[10%]'
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Type,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Type}`
      ),
      class: 'w-[10%]'
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Side,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Side}`
      )
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Price,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Price}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Amount,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Amount}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Leverage,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Leverage}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.Total,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Total}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesAdvancedOrdersTableColumn.TriggerCondition,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.TriggerCondition}`
      ),
      class: 'text-right'
    }
  ]

  if (xxl.value) {
    baseColumns.push({
      key: PortfolioFuturesAdvancedOrdersTableColumn.Action,
      label: t(
        `portfolio.table.futuresAdvancedOrders.${PortfolioFuturesAdvancedOrdersTableColumn.Action}`
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
      <template #market-data="{ row }">
        <div class="flex items-center gap-1">
          <PartialsCommonMarketRedirection
            class="flex items-center space-x-2 p-2 font-sans"
            v-bind="{ market: row.market }"
          >
            <CommonTokenIcon v-bind="{ token: row.market.baseToken }" />
            <p>{{ row.market.ticker }}</p>
          </PartialsCommonMarketRedirection>

          <PartialsPortfolioOrdersFuturesAdvancedOrdersTableCancelOrder
            v-if="!xxl"
            v-bind="{
              trigger: row.trigger,
              isAuthorized: row.isAuthorized,
              isCancelable: row.isCancelable
            }"
          />
        </div>
      </template>

      <template #type-data="{ row }">
        <div class="flex items-center p-2 font-sans">{{ row.type }}</div>
      </template>

      <template #side-data="{ row }">
        <div class="flex items-center p-2 font-sans">
          <div>
            <p
              :class="{
                'text-green-500': row.isBuy,
                'text-red-500': !row.isBuy
              }"
            >
              {{ $t(`trade.${row.isBuy ? 'buy' : 'sell'}`) }}
            </p>

            <p v-if="row.isReduceOnly" class="text-coolGray-500">
              {{ $t('trade.reduce_only') }}
            </p>
          </div>
        </div>
      </template>

      <template #price-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <span v-if="row.isMarketOrder">{{ $t('trade.market') }}</span>
          <span v-else>
            <AppAmount
              v-bind="{
                amount: row.price.toFixed(),
                decimalPlaces: row.priceDecimals
              }"
              class="font-mono"
            />
          </span>
        </div>
      </template>

      <template #amount-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <AppAmount
            v-bind="{
              amount: row.quantity.toFixed(),
              decimalPlaces: row.quantityDecimals
            }"
            class="font-mono"
          />
        </div>
      </template>

      <template #leverage-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <span v-if="row.leverage.isNaN()" class="text-coolGray-400">
            {{ $t('trade.not_available_n_a') }}
          </span>
          <span v-else class="font-mono">
            {{ row.leverage.toFormat(2) }} &times;
          </span>
        </div>
      </template>

      <template #total-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <AppAmount
            v-bind="{
              amount: row.total.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
            class="font-mono"
          />
          <span class="ml-1">{{ row.market.quoteToken.symbol }}</span>
        </div>
      </template>

      <template #trigger-condition-data="{ row }">
        <div class="flex items-center p-2 space-x-2 justify-end">
          <span class="text-coolGray-500 font-sans">
            {{ $t('trade.mark_price') }}
          </span>

          <span
            v-if="
              (row.isStopLoss && !row.isBuy) || (row.isTakeProfit && row.isBuy)
            "
            class="text-white font-semibold"
          >
            &le;
          </span>
          <span v-else class="text-white font-semibold"> &ge;</span>

          <span>
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

      <template #action-data="{ row }">
        <div class="p-2 flex justify-center">
          <PartialsPortfolioOrdersFuturesAdvancedOrdersTableCancelOrder
            v-bind="{
              trigger: row.trigger,
              isAuthorized: row.isAuthorized,
              isCancelable: row.isCancelable
            }"
          />
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersFuturesAdvancedOrdersMobileTable
      v-for="trigger in rows"
      :key="trigger.trigger.orderHash"
      v-bind="{ trigger, columns }"
    />
  </template>
</template>
