<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { TradeDirection, TradeExecutionType } from '@injectivelabs/ts-types'
import { DerivativeOrderSide, SpotOrderSide } from '@injectivelabs/sdk-ts'
import {
  UiDerivativeMarketWithToken,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
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
const { $onError, $onRejected } = useNuxtApp()
const { resetForm } = useForm()

const status = reactive(new Status(StatusType.Loading))
const { value: side } = useStringField({ name: 'side', rule: '' })
const { value: denom } = useStringField({ name: 'denom', rule: '' })
const { value: type } = useStringField({ name: 'type', rule: '' })

const limit = ref(UI_DEFAULT_PAGINATION_LIMIT_COUNT)
const page = ref(1)
const view = ref(ActivityView.Positions)
const endTime = ref(undefined as number | undefined)

const isStreamingView = computed(() => {
  return (
    view.value === ActivityView.Positions ||
    view.value === ActivityView.SpotOrders ||
    view.value === ActivityView.SpotTriggers ||
    view.value === ActivityView.DerivativeOrders ||
    view.value === ActivityView.DerivativeTriggers
  )
})

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

const markets = computed(() => {
  if (!denom.value || denom.value === '') {
    return isSpot.value ? spotMarkets.value : derivativeMarkets.value
  }

  if (isSpot.value) {
    return spotMarkets.value.filter(
      (m: UiSpotMarketWithToken) =>
        m.baseToken.denom === denom.value || m.quoteToken.denom === denom.value
    )
  }

  return derivativeMarkets.value.filter(
    (m: UiDerivativeMarketWithToken) =>
      m.baseToken.denom === denom.value || m.quoteToken.denom === denom.value
  )
})

const marketId = computed(() => {
  if (markets.value.length === 0) {
    return undefined
  }

  return markets.value[0].marketId
})

const marketIds = computed(() => {
  return markets.value.map((m) => m.marketId)
})

const activeMarket = computed(() => {
  if (isSpot.value) {
    return spotMarkets.value.find(
      (m: UiSpotMarketWithToken) => m.marketId === marketId.value
    )
  }

  return derivativeMarkets.value.find(
    (m: UiDerivativeMarketWithToken) => m.marketId === marketId.value
  )
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
        marketIds: marketIds.value,
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
        marketIds: marketIds.value,
        orderTypes: orderTypes.value,
        executionTypes: executionTypes.value,
        direction: side.value as DerivativeOrderSide
      }
    case ActivityView.DerivativeOrderHistory:
      return {
        marketIds: marketIds.value,
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

const shouldUpdateTotalCounts = computed(() => {
  if (
    ![
      ActivityView.Positions,
      ActivityView.SpotOrders,
      ActivityView.DerivativeOrders
    ].includes(view.value)
  ) {
    return false
  }

  const hasNoSide = side.value === ''
  const hasNoMarketFilter = isSpot.value
    ? spotStore.markets.every((m) => marketIds.value.includes(m.marketId))
    : derivativeStore.markets.every((m) => marketIds.value.includes(m.marketId))

  return hasNoSide && hasNoMarketFilter
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
  const fetchOptions = {
    options: { updateTotalCounts: true }
  }

  const promises = [
    derivativeStore.fetchSubaccountOrders(fetchOptions),
    spotStore.fetchSubaccountOrders(fetchOptions),
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

watch([page, limit, denom, side, type], () => fetchData())
watch([view], () => fetchDataAndUpdateEndTime())

function fetchData() {
  status.setLoading()

  _fetchData()
    .catch($onRejected)
    .finally(() => {
      status.setIdle()
    })
}

function fetchDataAndUpdateEndTime() {
  _fetchData()
    .catch($onRejected)
    .then(() => {
      updateEndTime()
    })
    .finally(() => {
      status.setIdle()
    })
}

function _fetchData() {
  return new Promise((resolve, reject) => {
    if (!action.value) {
      return reject(new Error('Invalid action. Could not fetch results.'))
    }

    if (Array.isArray(action.value)) {
      return Promise.all(action.value).catch(reject).then(resolve)
    }

    action
      .value({
        filters: filterParams.value as FilterOptions,
        pagination: {
          skip: skip.value,
          limit: limit.value,
          endTime: !isStreamingView.value ? endTime.value : undefined
        },
        options: {
          updateTotalCounts: shouldUpdateTotalCounts.value
        }
      })
      .catch(reject)
      .then(resolve)
  })
}

function updateEndTime() {
  switch (view.value) {
    case ActivityView.FundingPayments:
      endTime.value = activityStore.subaccountFundingPayments[0]?.timestamp || 0
      break
    case ActivityView.SpotOrderHistory:
      endTime.value = spotStore.subaccountOrderHistory[0]?.updatedAt || 0
      break
    case ActivityView.SpotTradeHistory:
      endTime.value = spotStore.subaccountTrades[0]?.timestamp || 0
      break
    case ActivityView.DerivativeOrderHistory:
      endTime.value = derivativeStore.subaccountOrderHistory[0]?.updatedAt || 0
      break
    case ActivityView.DerivativeTradeHistory:
      endTime.value = derivativeStore.subaccountTrades[0]?.executedAt || 0
      break
    default:
      endTime.value = undefined
      break
  }
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
