<script setup lang="ts">
import { PortfolioFuturesAdvancedOrdersTableColumn } from '@/types'
import type {
  UTableColumn,
  TransformedPortfolioFuturesAdvancedOrders
} from '@/types'

const { sm } = useSharedBreakpoints()

const props = withDefaults(
  defineProps<{
    columns: UTableColumn[]
    trigger: TransformedPortfolioFuturesAdvancedOrders
  }>(),
  {}
)

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === PortfolioFuturesAdvancedOrdersTableColumn.Market) {
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
      <div class="flex items-start gap-2 mb-6 justify-between">
        <PartialsCommonMarketRedirection
          class="flex items-center space-x-2 font-sans"
          v-bind="{ market: trigger.market }"
        >
          <CommonTokenIcon
            v-bind="{ token: trigger.market.baseToken }"
            :is-sm="true"
          />
          <p class="text-sm text-coolGray-200">
            {{ trigger.market.ticker }}
          </p>
        </PartialsCommonMarketRedirection>

        <PartialsPortfolioOrdersFuturesAdvancedOrdersTableCancelOrder
          v-bind="{
            trigger: trigger.trigger,
            isAuthorized: trigger.isAuthorized,
            isCancelable: trigger.isCancelable
          }"
        />
      </div>
    </template>

    <template #type-data>
      <div class="flex items-center font-sans">{{ trigger.type }}</div>
    </template>

    <template #side-data>
      <div class="flex items-center font-sans">
        <div>
          <p
            :class="[
              `${sm ? 'text-center' : 'text-end'}`,
              {
                'text-green-500': trigger.isBuy,
                'text-red-500': !trigger.isBuy
              }
            ]"
          >
            {{ $t(`trade.${trigger.isBuy ? 'buy' : 'sell'}`) }}
          </p>

          <p v-if="trigger.isReduceOnly" class="text-coolGray-500">
            {{ $t('trade.reduce_only') }}
          </p>
        </div>
      </div>
    </template>

    <template #price-data>
      <div class="flex items-center">
        <span v-if="trigger.isMarketOrder">{{ $t('trade.market') }}</span>
        <span v-else>
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              amount: trigger.price.toFixed(),
              decimals: trigger.priceDecimals
            }"
          />
        </span>
      </div>
    </template>

    <template #amount-data>
      <div class="flex items-center">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: trigger.quantity.toFixed(),
            decimals: trigger.quantityDecimals
          }"
        />
      </div>
    </template>

    <template #leverage-data>
      <div class="flex items-center">
        <span v-if="trigger.leverage.isNaN()" class="text-coolGray-400">
          {{ $t('trade.notAvailableNA') }}
        </span>
        <span v-else> {{ trigger.leverage.toFormat(2) }} &times; </span>
      </div>
    </template>

    <template #total-data>
      <div class="flex items-center">
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            amount: trigger.total.toFixed(),
            decimals: trigger.priceDecimals
          }"
        />
        <span class="ml-1">{{ trigger.market.quoteToken.symbol }}</span>
      </div>
    </template>

    <template #trigger-condition-data>
      <div class="flex items-center space-x-2">
        <span class="text-coolGray-500 font-sans">
          {{ $t('trade.markPrice') }}
        </span>

        <span
          v-if="
            (trigger.isStopLoss && !trigger.isBuy) ||
            (trigger.isTakeProfit && trigger.isBuy)
          "
          class="text-white font-semibold"
        >
          &le;
        </span>
        <span v-else class="text-white font-semibold"> &ge;</span>

        <span>
          <SharedAmount
            v-bind="{
              useSubscript: true,
              shouldAbbreviate: false,
              decimals: trigger.priceDecimals,
              amount: trigger.triggerPrice.toFixed()
            }"
          />
        </span>
      </div>
    </template>
  </AppMobileTable>
</template>
