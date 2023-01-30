<script lang="ts" setup>
import { PropType } from 'vue'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/sdk-ts'
import {
  ActivityField,
  ActivityTab,
  ActivityView,
  ConditionalOrderType
} from '@/types'
import {
  orderTypeToOrderTypes,
  tradeTypesToTradeExecutionTypes
} from '@/app/client/utils/activity'

const { t } = useLang()

const props = defineProps({
  tab: {
    type: String as PropType<ActivityTab>,
    required: true
  },

  view: {
    type: String as PropType<ActivityView>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'reset:filters'): void
}>()

const { value: denom } = useStringField({ name: ActivityField.Denom, rule: '' })
const { value: side } = useStringField({ name: ActivityField.Side, rule: '' })
const { value: type } = useStringField({ name: ActivityField.Type, rule: '' })

const showClearFiltersButton = computed(
  () => !!denom.value || !!side.value || !!type.value
)

// const filterParams = computed(() => {
//   const defaultFilterParams = {
//     marketIds: marketIds.value
//   }

//   switch (props.view) {
//     case ActivityView.FundingPayments:
//       return defaultFilterParams
//     case ActivityView.Positions:
//       return {
//         ...defaultFilterParams,
//         direction: side.value
//       }
//     case ActivityView.DerivativeOrders:
//     case ActivityView.SpotOrders:
//       return {
//         ...defaultFilterParams,
//         orderSide: side.value
//       }
//     case ActivityView.SpotOrderHistory:
//     case ActivityView.DerivativeOrderHistory:
//     case ActivityView.DerivativeTriggers:
//       return {
//         marketIds: marketIds.value,
//         orderTypes: orderTypes.value,
//         executionTypes: executionTypes.value,
//         direction: side.value
//       }
//     case ActivityView.DerivativeTradeHistory:
//     case ActivityView.SpotTradeHistory:
//       return {
//         ...defaultFilterParams,
//         types: tradeTypesToTradeExecutionTypes(type.value),
//         direction: side.value
//       }
//     case ActivityView.WalletTransfers:
//       return {
//         denom: denom.value
//       }
//     default:
//       return {}
//   }
// })

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

  if (props.tab === ActivityTab.Derivatives) {
    result = [
      ...result,
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
  }

  return result
})

// const orderType = computed(() => {
//   const [executionType, orderType] = type.value.split('-')

//   return { executionType, orderType }
// })

// const executionTypes = computed(() => {
//   if (!orderType.value || !orderType.value.executionType) {
//     return undefined
//   }

//   return [orderType.value.executionType] as TradeExecutionType[]
// })

// const orderTypes = computed(() => {
//   if (!orderType.value || !orderType.value.executionType) {
//     return []
//   }

//   return orderTypeToOrderTypes(orderType.value.orderType)
// })

function handleClearFilters() {
  emit('reset:filters')
}
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between gap-4 w-full">
    <div class="grid grid-cols-4 items-center gap-4 w-full">
      <PartialsActivityCommonSearch
        v-model="denom"
        class="col-span-2 sm:col-span-1"
        :tab="tab"
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
        :placeholder="'Type'"
        class="col-span-2 sm:col-span-1"
        clearable
        data-cy="universal-table-filter-by-type-drop-down"
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
      />

      <PartialsActivityCommonClearFiltersButton
        v-if="showClearFiltersButton"
        @clear="handleClearFilters"
      />
    </div>

    <PartialsActivityViewsPositionsActions
      v-if="view === ActivityView.Positions"
      v-bind="{ view, denom, side }"
    />

    <PartialsActivityViewsSpotActions
      v-if="view === ActivityView.SpotOrders"
      v-bind="{ view, denom, side }"
    />

    <PartialsActivityViewsDerivativesActions
      v-if="
        view === ActivityView.DerivativeOrders ||
        view === ActivityView.DerivativeTriggers
      "
      v-bind="{ view, denom, side }"
    />
  </div>
</template>
