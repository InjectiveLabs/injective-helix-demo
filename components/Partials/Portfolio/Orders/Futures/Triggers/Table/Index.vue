<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { DerivativeOrderHistory } from '@injectivelabs/sdk-ts'
import { PortfolioFuturesTriggersTableColumn } from '@/types'

const { t } = useLang()
const { lg } = useTwBreakpoints()
const { $onError } = useNuxtApp()
const derivativeStore = useDerivativeStore()
const notificationStore = useSharedNotificationStore()

const props = withDefaults(
  defineProps<{
    triggers: DerivativeOrderHistory[]
  }>(),
  {}
)

const { rows } = useFuturesTriggersTransformer(computed(() => props.triggers))

const columns = [
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

          <AppTablePopover>
            <div class="rounded-lg p-2 bg-brand-800 min-w-28">
              <AppButton
                variant="danger-ghost"
                class="p-2 w-full"
                size="sm"
                :status="status"
                :disabled="!row.isCancelable"
                :tooltip="row.isAuthorized ? '' : $t('common.unauthorized')"
                @click="cancelOrder(row.trigger, row.isCancelable)"
              >
                Cancel Order
              </AppButton>
            </div>
          </AppTablePopover>
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
          />
        </div>
      </template>

      <template #leverage-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <span v-if="row.leverage.isNaN()" class="text-coolGray-400">
            {{ $t('trade.not_available_n_a') }}
          </span>
          <span v-else>{{ row.leverage.toFormat(2) }} &times;</span>
        </div>
      </template>

      <template #total-data="{ row }">
        <div class="flex items-center p-2 justify-end">
          <AppAmount
            v-bind="{
              amount: row.total.toFixed(),
              decimalPlaces: row.priceDecimals
            }"
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
            />
          </span>
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
