<script setup lang="ts">
import { Status } from '@injectivelabs/utils'
import {
  UTableColumn,
  TransformedPortfolioFuturesTriggers,
  PortfolioFuturesTriggersTableColumn
} from '@/types'

const { sm } = useTwBreakpoints()

const props = withDefaults(
  defineProps<{
    status: Status
    columns: UTableColumn[]
    trigger: TransformedPortfolioFuturesTriggers
  }>(),
  {}
)

const emit = defineEmits<{
  'order:cancel': []
}>()

const filteredColumns = computed(() =>
  props.columns.reduce((list, column) => {
    if (column.key === PortfolioFuturesTriggersTableColumn.Market) {
      return list
    }

    list.push({ ...column, class: '' })

    return list
  }, [] as UTableColumn[])
)

function cancelOrder() {
  emit('order:cancel')
}
</script>

<template>
  <AppMobileTable :columns="filteredColumns">
    <template #header>
      <div class="flex items-start gap-2 mb-6 justify-between">
        <div class="flex flex-col gap-2">
          <p class="text-white text-sm font-semibold">
            {{
              $t(
                `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Market}`
              )
            }}
          </p>

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
        </div>

        <AppButton
          size="sm"
          class="py-2"
          variant="danger"
          :status="status"
          :disabled="!trigger.isAuthorized"
          :tooltip="trigger.isAuthorized ? '' : $t('common.unauthorized')"
          @click="cancelOrder"
        >
          Cancel Order
        </AppButton>
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
          <AppAmount
            v-bind="{
              amount: trigger.price.toFixed(),
              decimalPlaces: trigger.priceDecimals
            }"
          />
        </span>
      </div>
    </template>

    <template #amount-data>
      <div class="flex items-center">
        <AppAmount
          v-bind="{
            amount: trigger.quantity.toFixed(),
            decimalPlaces: trigger.quantityDecimals
          }"
        />
      </div>
    </template>

    <template #leverage-data>
      <div class="flex items-center">
        <span v-if="trigger.leverage.isNaN()" class="text-coolGray-400">
          {{ $t('trade.not_available_n_a') }}
        </span>
        <span v-else>{{ trigger.leverage.toFormat(2) }} &times;</span>
      </div>
    </template>

    <template #total-data>
      <div class="flex items-center">
        <AppAmount
          v-bind="{
            amount: trigger.total.toFixed(),
            decimalPlaces: trigger.priceDecimals
          }"
        />
        <span class="ml-1">{{ trigger.market.quoteToken.symbol }}</span>
      </div>
    </template>

    <template #trigger-condition-data>
      <div class="flex items-center space-x-2">
        <span class="text-coolGray-500 font-sans">
          {{ $t('trade.mark_price') }}
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
          <AppAmount
            v-bind="{
              amount: trigger.triggerPrice.toFixed(),
              decimalPlaces: trigger.priceDecimals
            }"
          />
        </span>
      </div>
    </template>
  </AppMobileTable>
</template>
