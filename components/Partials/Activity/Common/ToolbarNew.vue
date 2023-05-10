<script lang="ts" setup>
// import { PropType } from 'vue'
import type { Token } from '@injectivelabs/token-metadata'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/sdk-ts'
// import { Status, StatusType } from '@injectivelabs/utils'
import {
  BusEvents,
  ActivityField,
  ConditionalOrderType,
  ActivityForm,
  ActivityPage,
  UiMarketWithToken
} from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const derivativeStore = useDerivativeStore()
const { t } = useLang()

// const props = defineProps({
//   status: {
//     type: Object as PropType<Status>,
//     default: () => new Status(StatusType.Idle)
//   }
// })

// const emit = defineEmits<{
//   (e: 'update:filter'): void
//   (e: 'reset:filter'): void
// }>()

const { value: denom } = useStringField({
  name: ActivityField.Denom,
  rule: '',
  initialValue: ''
})
const { value: side } = useStringField({ name: ActivityField.Side, rule: '' })
const { value: type } = useStringField({ name: ActivityField.Type, rule: '' })
const resetForm = useResetForm<ActivityForm>()

const hasActiveFilters = computed(
  () => !!denom.value || !!side.value || !!type.value
)

const isSpot = computed(
  () =>
    route.name?.toString().startsWith('activity-spot') ||
    route.name?.toString().startsWith('activity-wallet-history')
)

const markets = computed<UiMarketWithToken[]>(() =>
  isSpot.value ? spotStore.markets : derivativeStore.markets
)

const tokens = computed(() => {
  if (!markets.value) {
    return []
  }

  const tokens = markets.value.reduce((tokens, market) => {
    return [...tokens, market.baseToken, market.quoteToken]
  }, [] as Token[])

  const uniqueTokens = [
    ...new Map(tokens.map((token) => [token.denom, token])).values()
  ]

  return uniqueTokens
})

const showTypeField = computed(() => {
  return [
    ActivityPage.DerivativeOrderHistory,
    ActivityPage.DerivativeTradeHistory,
    ActivityPage.DerivativeTriggers,
    ActivityPage.SpotOrderHistory,
    ActivityPage.SpotTradeHistory
  ].includes(route.name as ActivityPage)
})

const sideOptions = computed(() => {
  if (route.name?.toString().startsWith('activity-positions')) {
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

  if (route.name?.toString().startsWith('activity-spot')) {
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

  if (route.name?.toString().includes(ActivityPage.DerivativeTriggers)) {
    return derivativeTypes
  }

  if (
    route.name?.toString().includes(ActivityPage.DerivativeOrderHistory) ||
    route.name?.toString().includes(ActivityPage.DerivativeTradeHistory)
  ) {
    result = [...result, ...derivativeTypes]
  }

  return result
})

function handleClearFilters() {
  resetForm()
  useEventBus<string>(BusEvents.ActivityFilterUpdate).emit()
}

function handleUpdate() {
  useEventBus<string>(BusEvents.ActivityFilterUpdate).emit()
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
    <div class="grid grid-cols-4 items-center gap-4 w-full">
      <PartialsActivityCommonMarketFilter
        v-model="denom"
        class="col-span-2 sm:col-span-1"
        :tokens="tokens"
        @update:model-value="handleUpdate"
      />

      <AppSelectField
        v-if="showTypeField"
        v-model="type"
        class="col-span-2 sm:col-span-1"
        :options="typeOptions"
        :placeholder="$t('activity.common.type')"
        clearable
        data-cy="universal-table-filter-by-type-drop-down"
        @update:model-value="handleUpdate"
      />

      <AppSelectField
        v-if="
          !$route.name?.toString().includes('activity-wallet-history') &&
          !$route.name
            ?.toString()
            .includes('activity-positions-funding-payments')
        "
        v-model="side"
        class="col-span-2 sm:col-span-1"
        :options="sideOptions"
        :placeholder="$t('trade.side')"
        clearable
        data-cy="universal-table-filter-by-asset-input"
        @update:model-value="handleUpdate"
      />

      <div
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

        <PartialsActivityRefreshButton @click="handleClearFilters" />
      </div>
    </div>

    <div id="activity-toolbar-action" />
  </div>
</template>
