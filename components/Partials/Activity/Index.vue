<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'
import { DerivativeOrderSide, SpotOrderSide } from '@injectivelabs/sdk-ts'
import {
  orderTypeToOrderTypes,
  tradeTypesToTradeExecutionTypes
} from '@/app/client/utils/activity'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '@/app/utils/constants'
import { ActivityView, TradeTypes, FilterOptions } from '@/types'

const spotStore = useSpotStore()
const bridgeStore = useBridgeStore()
const activityStore = useActivityStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { resetForm } = useForm()

const status = reactive(new Status(StatusType.Loading))
const { value: side } = useStringField({ name: 'side', rule: '' })
const { value: denom } = useStringField({ name: 'denom', rule: '' })
const { value: type } = useStringField({ name: 'type', rule: '' })

const limit = ref(UI_DEFAULT_PAGINATION_LIMIT_COUNT)
const page = ref(1)
const view = ref(ActivityView.Positions)

const isSpot = computed(() => {
  return (
    view.value === ActivityView.SpotOrders ||
    view.value === ActivityView.SpotTriggers ||
    view.value === ActivityView.SpotOrderHistory ||
    view.value === ActivityView.SpotTradeHistory
  )
})

const spotMarkets = computed(() => {
  return spotStore.markets
})

const derivativeMarkets = computed(() => {
  return derivativeStore.markets
})

const activeMarket = computed(() => {
  if (!denom.value || denom.value === '') {
    return undefined
  }

  return [...spotMarkets.value, ...derivativeMarkets.value].find(
    (m) =>
      m.baseToken.denom === denom.value || m.quoteToken.denom === denom.value
  )
})

const marketIds = computed(() =>
  isSpot.value ? spotStore.activeMarketIds : derivativeStore.activeMarketIds
)

const marketId = computed(() => {
  if (
    !activeMarket.value ||
    denom.value === 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7'
  ) {
    return undefined
  }

  return activeMarket.value.marketId
})

const orderType = computed(() => {
  const [executionType, orderType] = type.value.split('-')

  return { executionType, orderType }
})

const executionTypes = computed(() => {
  if (!orderType.value || !orderType.value.executionType) {
    return undefined
  }

  return [orderType.value.executionType] as TradeExecutionType[]
})

const orderTypes = computed(() => {
  if (!orderType.value || !orderType.value.executionType) {
    return []
  }

  return orderTypeToOrderTypes(orderType.value.orderType)
})

const tradeTypes = computed(() => {
  return tradeTypesToTradeExecutionTypes(type.value as TradeTypes)
})

const action = computed(() => {
  switch (view.value) {
    case ActivityView.Positions:
      return positionStore.fetchSubaccountPositions
    case ActivityView.FundingPayments:
      return activityStore.fetchSubaccountFundingPayments
    case ActivityView.SpotOrders:
      return spotStore.fetchSubaccountOrders
    case ActivityView.SpotOrderHistory:
      return spotStore.fetchSubaccountOrderHistory
    case ActivityView.SpotTradeHistory:
      return spotStore.fetchSubaccountTrades
    case ActivityView.DerivativeOrders:
      return derivativeStore.fetchSubaccountOrders
    case ActivityView.DerivativeTriggers:
      return derivativeStore.fetchSubaccountConditionalOrders
    case ActivityView.DerivativeOrderHistory:
      return derivativeStore.fetchSubaccountOrderHistory
    case ActivityView.DerivativeTradeHistory:
      return derivativeStore.fetchSubaccountTrades
    case ActivityView.WalletTransfers:
      return bridgeStore.fetchSubaccountTransfers
    case ActivityView.WalletDeposits:
    case ActivityView.WalletWithdrawals:
      return [
        bridgeStore.fetchPeggyWithdrawalTransactions,
        bridgeStore.fetchIBCTransferTransactions,
        bridgeStore.fetchInjectiveTransactions
      ]
    default:
      return undefined
  }
})

const filterParams = computed(() => {
  const defaultFilterParams = {
    marketId: marketId.value,
    marketIds: marketIds.value
  }

  switch (view.value) {
    case ActivityView.Positions:
      return {
        ...defaultFilterParams,
        direction: side.value as TradeDirection
      }
    case ActivityView.FundingPayments:
      return defaultFilterParams
    case ActivityView.SpotOrders:
      return {
        ...defaultFilterParams,
        orderSide: side.value as SpotOrderSide
      }
    case ActivityView.SpotOrderHistory:
      return {
        marketId: marketId.value,
        orderTypes: orderTypes.value,
        executionTypes: executionTypes.value,
        direction: side.value as TradeDirection
      }
    case ActivityView.SpotTradeHistory:
      return {
        ...defaultFilterParams,
        types: tradeTypes.value,
        direction: side.value as TradeDirection
      }
    case ActivityView.DerivativeOrders:
      return {
        ...defaultFilterParams,
        orderSide: side.value as DerivativeOrderSide
      }
    case ActivityView.DerivativeTriggers:
      return {
        marketId: marketId.value,
        marketIds: marketIds.value,
        orderTypes: orderTypes.value,
        executionTypes: executionTypes.value,
        direction: side.value as DerivativeOrderSide
      }
    case ActivityView.DerivativeOrderHistory:
      return {
        marketId: marketId.value,
        orderTypes: orderTypes.value,
        executionTypes: executionTypes.value,
        direction: side.value as TradeDirection
      }
    case ActivityView.DerivativeTradeHistory:
      return {
        ...defaultFilterParams,
        types: tradeTypes.value,
        direction: side.value as TradeDirection
      }
    case ActivityView.WalletTransfers:
      return {
        denom: denom.value
      }
    default:
      return {}
  }
})

const skip = computed(() => (page.value - 1) * limit.value)

const symbol = computed(() => {
  if (!activeMarket.value) {
    return ''
  }

  if (activeMarket.value.baseToken.denom === denom.value) {
    return activeMarket.value.baseToken.symbol
  }

  return activeMarket.value.quoteToken.symbol
})

onMounted(() => {
  const promises = [
    derivativeStore.fetchSubaccountOrders(),
    spotStore.fetchSubaccountOrders(),
    positionStore.streamSubaccountPositions(),
    spotStore.streamSubaccountOrders(),
    spotStore.streamSubaccountOrderHistory(),
    derivativeStore.streamSubaccountOrders(),
    derivativeStore.streamSubaccountOrderHistory()
  ]

  if (activeMarket.value && marketId.value) {
    promises.push(
      isSpot.value
        ? spotStore.streamSubaccountTrades(marketId.value)
        : derivativeStore.streamTrades(marketId.value)
    )
  }

  Promise.all(promises)
    .then(() => {
      fetchData()
    })
    .catch($onError)
})

watch([view, page, limit], () => fetchData())
watch([denom, side, type], () => fetchData(true))

function fetchData(forceEndTime?: boolean) {
  if (!action.value) {
    return
  }

  status.setLoading()

  if (Array.isArray(action.value)) {
    return Promise.all(action.value)
      .catch($onError)
      .then(() => {
        status.setIdle()
      })
  }

  action
    .value({
      filters: filterParams.value as FilterOptions,
      pagination: {
        skip: skip.value,
        limit: limit.value,
        endTime: forceEndTime ? 0 : undefined
      }
    })
    .catch($onError)
    .then(() => {
      status.setIdle()
    })
}

function onViewChange() {
  resetForm()
  page.value = 1
  limit.value = UI_DEFAULT_PAGINATION_LIMIT_COUNT
}
</script>

<template>
  <div class="h-full min-h-screen-excluding-header pt-6 sm:pb-8 flex flex-col">
    <PartialsActivityCommonNavigation
      v-model:view="view"
      :status="status"
      @update:view="onViewChange"
    />

    <div class="mt-4 pt-4 pb-8 sm:pb-0 xs:mt-6 xs:pt-6 border-t" />

    <PartialsActivityCommonTabs
      v-model:view="view"
      :status="status"
      @update:view="onViewChange"
    />

    <CommonCard md class="h-full mt-4 xs:mt-6 flex flex-col grow">
      <PartialsActivityCommonToolbar
        v-model:side="side"
        v-model:type="type"
        v-model:denom="denom"
        :view="view"
        @update:view="onViewChange"
      />

      <PartialsActivityView v-bind="{ view, status, symbol }" :key="view" />

      <PartialsActivityCommonPagination
        v-model:page="page"
        v-model:limit="limit"
        v-model:view="view"
        :status="status"
        @update:view="onViewChange"
      />
    </CommonCard>
  </div>

  <ModalsAddMargin />
</template>
