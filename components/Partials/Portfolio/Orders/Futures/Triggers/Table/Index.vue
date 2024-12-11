<script setup lang="ts">
import { NuxtUiIcons } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { PortfolioFuturesTriggersTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()
const { $onError } = useNuxtApp()
const breakpoints = useBreakpointsTw()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()

const props = withDefaults(
  defineProps<{
    triggers: DerivativeOrderHistory[]
  }>(),
  {}
)

const { rows } = useFuturesTriggersTransformer(computed(() => props.triggers))

const xxl = breakpoints['2xl']

const columns = computed(() => {
  const baseColumns = [
    {
      key: PortfolioFuturesTriggersTableColumn.Market,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Market}`
      ),
      class: 'w-[10%]'
    },
    {
      key: PortfolioFuturesTriggersTableColumn.Type,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Type}`
      ),
      class: 'w-[10%]'
    },
    {
      key: PortfolioFuturesTriggersTableColumn.Side,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Side}`
      )
    },
    {
      key: PortfolioFuturesTriggersTableColumn.Price,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Price}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesTriggersTableColumn.Amount,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Amount}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesTriggersTableColumn.Leverage,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Leverage}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesTriggersTableColumn.Total,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Total}`
      ),
      class: 'text-right'
    },
    {
      key: PortfolioFuturesTriggersTableColumn.TriggerCondition,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.TriggerCondition}`
      ),
      class: 'text-right'
    }
  ]

  if (xxl.value) {
    baseColumns.push({
      key: PortfolioFuturesTriggersTableColumn.Action,
      label: t(
        `portfolio.table.futuresTriggers.${PortfolioFuturesTriggersTableColumn.Action}`
      ),
      class: 'text-center'
    })
  }

  return baseColumns
})

const status = reactive(new Status(StatusType.Idle))

function cancelOrder(trigger: DerivativeOrderHistory, isCancelable: boolean) {
  if (!isCancelable) {
    return
  }

  status.setLoading()

  derivativeStore
    .cancelOrder(trigger)
    .then(() => notificationStore.success({ title: t('common.success') }))
    .catch((e) => {
      notificationStore.error({ title: t('common.error') })
      $onError(e)
    })
    .finally(() => {
      status.setIdle()
    })
}
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

          <AppButton
            v-if="!xxl"
            size="xs"
            :status="status"
            variant="danger-shade"
            class="p-1 outline-none rounded-full"
            :disabled="!row.isCancelable"
            :title="$t('trade.cancelOrder')"
            :tooltip="row.isAuthorized ? '' : $t('common.unauthorized')"
            @click="cancelOrder(row.trigger, row.isCancelable)"
          >
            <UIcon :name="NuxtUiIcons.Trash" class="size-4" />
          </AppButton>
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
          <AppButton
            v-bind="{
              status,
              disabled: !row.isCancelable,
              tooltip: row.isAuthorized ? '' : $t('common.unauthorized')
            }"
            size="sm"
            variant="danger-shade"
            class="min-w-16"
            @click="cancelOrder(row.trigger, row.isCancelable)"
          >
            {{ $t('trade.cancelOrder') }}
          </AppButton>
        </div>
      </template>
    </UTable>
  </template>

  <template v-else>
    <PartialsPortfolioOrdersFuturesTriggersMobileTable
      v-for="trigger in rows"
      :key="trigger.trigger.orderHash"
      v-bind="{ trigger, columns, status }"
      @order:cancel="cancelOrder(trigger.trigger, trigger.isCancelable)"
    />
  </template>
</template>
