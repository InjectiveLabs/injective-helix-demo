<script lang="ts" setup>
import { PropType } from 'vue'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/sdk-ts'
import { BalanceWithToken } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import {
  ActivityField,
  ActivityTab,
  ActivityView,
  ConditionalOrderType,
  UiMarketWithToken
} from '@/types'
import {
  executionOrderTypeToOrderTypes,
  executionOrderTypeToOrderExecutionTypes,
  executionOrderTypeToTradeExecutionTypes
} from '@/app/client/utils/activity'

const derivativeStore = useDerivativeStore()
const spotStore = useSpotStore()
const { t } = useLang()

const props = defineProps({
  tab: {
    type: String as PropType<ActivityTab>,
    required: true
  },

  view: {
    type: String as PropType<ActivityView>,
    required: true
  },

  status: {
    type: Object as PropType<Status>,
    default: () => new Status(StatusType.Idle)
  }
})

const emit = defineEmits<{
  (e: 'update:filter'): void
  (e: 'reset:filter'): void
}>()

const { value: denom } = useStringField({ name: ActivityField.Denom, rule: '' })
const { value: side } = useStringField({ name: ActivityField.Side, rule: '' })
const { value: type } = useStringField({ name: ActivityField.Type, rule: '' })
const { value: symbol } = useStringField({
  name: ActivityField.Symbol,
  rule: ''
})

const hasActiveFilters = computed(
  () => !!denom.value || !!side.value || !!type.value
)

const markets = computed<UiMarketWithToken[]>(() =>
  [ActivityTab.Spot, ActivityTab.WalletHistory].includes(props.tab)
    ? spotStore.markets
    : derivativeStore.markets
)

const tokens = computed(() => {
  if (!markets.value) {
    return []
  }

  const tokens = markets.value.reduce((tokens, market) => {
    const baseToken = {
      balance: '',
      denom: market.baseToken.denom,
      token: market.baseToken
    } as BalanceWithToken

    const quoteToken = {
      balance: '',
      denom: market.quoteDenom,
      token: market.quoteToken
    } as BalanceWithToken

    return [...tokens, baseToken, quoteToken]
  }, [] as BalanceWithToken[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const marketIds = computed(() =>
  denom.value
    ? markets.value
        .filter(({ baseToken, quoteToken }) =>
          [baseToken.denom, quoteToken.denom].includes(denom.value)
        )
        .map(({ marketId }) => marketId)
    : undefined
)

const filterParams = computed(() => {
  const defaultFilterParams = {
    marketIds: marketIds.value
  }

  if (!hasActiveFilters.value) {
    return undefined
  }

  switch (props.view) {
    case ActivityView.FundingPayments:
      return defaultFilterParams
    case ActivityView.DerivativeOrderHistory:
    case ActivityView.SpotOrderHistory:
      return {
        ...defaultFilterParams,
        orderTypes: executionOrderTypeToOrderTypes(type.value),
        executionTypes: executionOrderTypeToOrderExecutionTypes(type.value),
        direction: side.value
      }
    case ActivityView.DerivativeTradeHistory:
    case ActivityView.SpotTradeHistory:
      return {
        ...defaultFilterParams,
        orderTypes: executionOrderTypeToOrderTypes(type.value),
        executionTypes: executionOrderTypeToTradeExecutionTypes(type.value),
        direction: side.value
      }
    case ActivityView.WalletTransfers:
      return {
        denom: denom.value
      }
    default:
      return {}
  }
})

const sideOptions = computed(() => {
  if (props.view === ActivityView.Positions) {
    return [
      {
        display: t('trade.long'),
        value: TradeDirection.Long
      },
      {
        display: t('trade.short'),
        value: TradeDirection.Short
      }
    ]
  }

  return [
    {
      display: t('trade.buy'),
      value: TradeDirection.Buy
    },
    {
      display: t('trade.sell'),
      value: TradeDirection.Sell
    }
  ]
})

const typeOptions = computed(() => {
  let result = [
    {
      display: t('trade.limit'),
      value: `${TradeExecutionType.LimitFill}`
    },
    {
      display: t('trade.market'),
      value: `${TradeExecutionType.Market}`
    }
  ]

  if (props.tab === ActivityTab.Spot) {
    return result
  }

  const derivativeTypes = [
    {
      display: `${t('trade.stopLoss')} ${t('trade.limit')}`,
      value: `${TradeExecutionType.LimitFill}-${ConditionalOrderType.StopLoss}`
    },
    {
      display: `${t('trade.stopLoss')} ${t('trade.market')}`,
      value: `${TradeExecutionType.Market}-${ConditionalOrderType.StopLoss}`
    },
    {
      display: `${t('trade.takeProfit')} ${t('trade.limit')}`,
      value: `${TradeExecutionType.LimitFill}-${ConditionalOrderType.TakeProfit}`
    },
    {
      display: `${t('trade.takeProfit')} ${t('trade.market')}`,
      value: `${TradeExecutionType.Market}-${ConditionalOrderType.TakeProfit}`
    }
  ]

  if (props.view === ActivityView.DerivativeTriggers) {
    return derivativeTypes
  }

  if (
    [
      ActivityView.DerivativeOrderHistory,
      ActivityView.DerivativeTradeHistory
    ].includes(props.view)
  ) {
    result = [...result, ...derivativeTypes]
  }

  return result
})

function handleClearFilters() {
  emit('reset:filter')
}

function handleUpdate() {
  emit('update:filter')
}

defineExpose({
  filterParams
})
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
    <div class="grid grid-cols-4 items-center gap-4 w-full">
      <PartialsActivityCommonSymbolFilter
        v-if="
          [
            ActivityView.WalletDeposits,
            ActivityView.WalletWithdrawals
          ].includes(view)
        "
        v-model="symbol"
        class="col-span-2 sm:col-span-1"
        :tokens="tokens"
        @update:model-value="handleUpdate"
      />

      <PartialsActivityCommonMarketFilter
        v-else
        v-model="denom"
        class="col-span-2 sm:col-span-1"
        :tab="tab"
        :tokens="tokens"
        @update:model-value="handleUpdate"
      />

      <AppSelectField
        v-if="
          [ActivityTab.Spot, ActivityTab.Derivatives].includes(tab) &&
          ![ActivityView.SpotOrders, ActivityView.DerivativeOrders].includes(
            view
          )
        "
        v-model="type"
        :options="typeOptions"
        :placeholder="$t('activity.common.type')"
        class="col-span-2 sm:col-span-1"
        clearable
        data-cy="universal-table-filter-by-type-drop-down"
        @update:model-value="handleUpdate"
      />

      <AppSelectField
        v-if="
          tab !== ActivityTab.WalletHistory &&
          view !== ActivityView.FundingPayments
        "
        v-model="side"
        :options="sideOptions"
        :placeholder="$t('trade.side')"
        class="col-span-2 sm:col-span-1"
        clearable
        data-cy="universal-table-filter-by-asset-input"
        @update:model-value="handleUpdate"
      />

      <div
        v-if="!status.isLoading()"
        class="flex items-center justify-between gap-1 text-sm col-span-4 sm:col-span-1"
        :class="{ 'justify-self-end': !hasActiveFilters }"
      >
        <AppButton
          v-if="hasActiveFilters"
          class="border-gray-500 text-gray-500 px-3"
          sm
          @click="handleClearFilters"
        >
          <div class="items-center flex gap-1">
            <BaseIcon name="close" md />
            <span>{{ $t('filters.clearAll') }}</span>
          </div>
        </AppButton>

        <PartialsAccountRefreshButton
          :status="status"
          :view="view"
          @click="handleClearFilters"
        />
      </div>
    </div>

    <div id="activity-toolbar-action" />
  </div>
</template>
