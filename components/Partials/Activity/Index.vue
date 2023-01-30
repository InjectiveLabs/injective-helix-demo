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
import {
  ActivityTab,
  ActivityView,
  ActivityForm,
  ActivityField,
  TradeTypes,
  FilterOptions
} from '@/types'

const spotStore = useSpotStore()
const bridgeStore = useBridgeStore()
const activityStore = useActivityStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { resetForm, values: formValues } = useForm<ActivityForm>()

const status = reactive(new Status(StatusType.Loading))

const tab = ref(ActivityTab.Positions)
const denom = ref('')
const side = ref('')
const type = ref('')
const view = ref(ActivityView.Positions)
const paginationRef = ref()

const isSpot = computed(() => tab.value === ActivityTab.Spot)

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

const marketIds = computed(() => {
  return markets.value.map((m) => m.marketId)
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
      return [
        bridgeStore.fetchPeggyDepositTransactions,
        bridgeStore.fetchIBCTransferTransactions,
        bridgeStore.fetchInjectiveTransactions
      ]
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

  // wtf?!
  // if (activeMarket.value && marketId.value) {
  //   promises.push(
  //     isSpot.value
  //       ? spotStore.streamSubaccountTrades(marketId.value)
  //       : derivativeStore.streamTrades(marketId.value)
  //   )
  // }

  Promise.all(promises)
    .then(() => {
      fetchData()
    })
    .catch($onError)
})

watch([denom, side, type], () => fetchData())

function fetchData() {
  if (!action.value) {
    return
  }

  console.log({ view: view.value })

  status.setLoading()

  Promise.all(
    Array.isArray(action.value)
      ? action.value
      : [
          action.value({
            filters: filterParams.value as FilterOptions,
            // pagination: {
            //   skip: skip.value,
            //   limit: limit.value,
            //   endTime: !isStreamingView.value ? endTime.value : undefined
            // },
            options: {
              updateTotalCounts: shouldUpdateTotalCounts.value
            }
          })
        ]
  )
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function _fetchData() {
  if (!action.value) {
    return
  }

  Promise.all(Array.isArray(action.value) ? action.value : [action.value])

  return new Promise((resolve, reject) => {
    console.log(paginationRef.value)

    if (paginationRef.value) {
      console.log(paginationRef.value.paginationOptions)
    }

    if (!action.value) {
      return reject(new Error('Invalid action. Could not fetch results.'))
    }

    if (Array.isArray(action.value)) {
      return Promise.all(action.value).catch(reject).then(resolve)
    }

    action
      .value({
        filters: filterParams.value as FilterOptions,
        // pagination: {
        //   skip: skip.value,
        //   limit: limit.value,
        //   endTime: !isStreamingView.value ? endTime.value : undefined
        // },
        options: {
          updateTotalCounts: shouldUpdateTotalCounts.value
        }
      })
      .then(resolve)
  })
}

function onTabChange(tab: string) {
  switch (tab) {
    case ActivityTab.Positions:
      view.value = ActivityView.Positions
      break
    case ActivityTab.Derivatives:
      view.value = ActivityView.DerivativeOrders
      break
    case ActivityTab.Spot:
      view.value = ActivityView.SpotOrders
      break
    default:
      view.value = ActivityView.WalletTransfers
      break
  }

  onViewChange()
}

function onViewChange() {
  console.log('on view change!')

  resetForm()
  nextTick(() => {
    fetchData()
  })
}
</script>

<template>
  <div class="h-full min-h-screen-excluding-header pt-6 sm:pb-8 flex flex-col">
    <PartialsActivityCommonNavigation
      v-model:tab="tab"
      :status="status"
      @update:tab="onTabChange"
    />

    <div class="mt-4 pt-4 pb-8 sm:pb-0 xs:mt-6 xs:pt-6 border-t" />

    <PartialsActivityCommonTabs
      v-model:view="view"
      :tab="tab"
      @update:view="onViewChange"
    />

    <CommonCard md class="h-full mt-4 xs:mt-6 flex flex-col grow">
      <PartialsActivityCommonToolbar
        v-model:side="side"
        v-model:type="type"
        v-model:denom="denom"
        :view="view"
        :tab="tab"
        @update:view="onViewChange"
      />

      <PartialsActivityView
        v-bind="{
          view,
          status,
          denom: formValues[ActivityField.Denom]
        }"
        :key="view"
      />

      <PartialsActivityCommonPagination
        v-if="
          ![
            ActivityView.Positions,
            ActivityView.DerivativeOrders,
            ActivityView.DerivativeTriggers,
            ActivityView.SpotOrders,
            ActivityView.WalletDeposits,
            ActivityView.WalletWithdrawals
          ].includes(view)
        "
        ref="paginationRef"
        :view="view"
        :status="status"
      />
    </CommonCard>
  </div>

  <ModalsAddMargin />
</template>
