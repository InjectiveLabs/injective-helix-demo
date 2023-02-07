<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { UI_DEFAULT_PAGINATION_LIMIT_COUNT } from '@/app/utils/constants'
import { ActivityTab, ActivityView, ActivityForm, ActivityField } from '@/types'

const spotStore = useSpotStore()
const bridgeStore = useBridgeStore()
const activityStore = useActivityStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()
const { resetForm, values: formValues, setFieldValue } = useForm<ActivityForm>()

const status = reactive(new Status(StatusType.Loading))

const filterRef = ref()
const paginationRef = ref()
const tab = ref(ActivityTab.Positions)
const view = ref(ActivityView.Positions)

const action = computed(() => {
  switch (view.value) {
    case ActivityView.FundingPayments:
      return activityStore.fetchSubaccountFundingPayments
    case ActivityView.SpotOrderHistory:
      return spotStore.fetchSubaccountOrderHistory
    case ActivityView.SpotTradeHistory:
      return spotStore.fetchSubaccountTrades
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

onMounted(() => {
  const promises = [
    activityStore.streamDerivativeSubaccountOrderHistory(),
    activityStore.streamDerivativeSubaccountTrades(),
    activityStore.streamSpotSubaccountOrderHistory(),
    activityStore.streamSpotSubaccountTrades(),
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.fetchSubaccountConditionalOrders(),
    derivativeStore.streamSubaccountOrders(),
    positionStore.fetchSubaccountPositions(),
    positionStore.streamSubaccountPositions(),
    spotStore.fetchSubaccountOrders(),
    spotStore.streamSubaccountOrders()
  ]

  Promise.all(promises)
    .then(() => {
      fetchData()
    })
    .catch($onError)
})

onUnmounted(() => {
  activityStore.$reset()
  derivativeStore.resetSubaccount()
  spotStore.resetSubaccount()
})

function fetchData() {
  if (!action.value) {
    status.setIdle()

    return
  }

  status.setLoading()

  Promise.all(
    Array.isArray(action.value)
      ? action.value
      : [
          action.value({
            filters: filterRef.value?.filterParams,
            pagination: paginationRef.value?.paginationOptions
          })
        ]
  )
    .catch($onError)
    .finally(() => {
      status.setIdle()
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

function handleFilterChange() {
  setFieldValue(ActivityField.Page, 1)
  setFieldValue(ActivityField.Limit, UI_DEFAULT_PAGINATION_LIMIT_COUNT)

  nextTick(() => {
    fetchData()
  })
}

function onViewChange() {
  resetForm()
  nextTick(() => {
    fetchData()
  })
}
</script>

<template>
  <div class="pt-6 sm:pb-8">
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

    <CommonCard
      md
      class="h-full mt-4 xs:mt-6 flex flex-col grow overflow-y-hidden"
    >
      <PartialsActivityCommonToolbar
        ref="filterRef"
        :view="view"
        :tab="tab"
        :status="status"
        @update:filter="handleFilterChange"
        @reset:filter="onViewChange"
      />

      <PartialsActivityView
        v-bind="{
          view,
          status,
          denom: formValues[ActivityField.Denom],
          side: formValues[ActivityField.Side],
          type: formValues[ActivityField.Type]
        }"
        :key="view"
        class="h-full-flex"
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
        @update:filter="fetchData"
      />
    </CommonCard>
  </div>

  <ModalsAddMargin />
</template>
