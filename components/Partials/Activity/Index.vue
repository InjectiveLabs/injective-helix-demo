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
const { resetForm, setFieldValue } = useForm<ActivityForm>({
  keepValuesOnUnmount: true
})

const router = useRouter()
const route = useRoute()

const status = reactive(new Status(StatusType.Loading))

const filterRef = ref()
const paginationRef = ref()
const tab = ref(ActivityTab.Positions)
const view = ref(ActivityView.Positions)

const action = computed(() => {
  switch (view.value) {
    case ActivityView.FundingPayments:
      return activityStore.fetchSubaccountFundingPayments
    case ActivityView.Positions:
      return positionStore.fetchSubaccountPositions
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
        bridgeStore.fetchPeggyDepositTransactions(),
        bridgeStore.fetchIBCTransferTransactions(),
        bridgeStore.fetchInjectiveTransactions()
      ]
    case ActivityView.WalletWithdrawals:
      return [
        bridgeStore.fetchPeggyWithdrawalTransactions(),
        bridgeStore.fetchIBCTransferTransactions(),
        bridgeStore.fetchInjectiveTransactions()
      ]
    default:
      return undefined
  }
})

onMounted(() => {
  refetchData()
})

onUnmounted(() => {
  activityStore.$reset()
  derivativeStore.resetSubaccount()
  spotStore.resetSubaccount()
})

function fetchData() {
  if (!action.value) {
    return status.setIdle()
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

function refetchData() {
  const fetchDataPromises = [
    activityStore.streamDerivativeSubaccountOrderHistory(),
    activityStore.streamDerivativeSubaccountTrades(),
    activityStore.streamSpotSubaccountOrderHistory(),
    activityStore.streamSpotSubaccountTrades(),
    derivativeStore.fetchSubaccountOrders(),
    derivativeStore.streamMarketsMarkPrices(),
    derivativeStore.fetchSubaccountConditionalOrders(),
    derivativeStore.streamSubaccountOrders(),
    positionStore.fetchSubaccountPositions(),
    positionStore.streamSubaccountPositions(),
    spotStore.fetchSubaccountOrders(),
    spotStore.streamSubaccountOrders()
  ]

  Promise.all(fetchDataPromises)
    .then(() => {
      fetchData()
    })
    .catch($onError)
    .finally(() => {
      setTabFromQuery()
    })
}

function onTabChange(tab: string) {
  router.push({ query: { tab } })
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

function onSubaccountChange() {
  resetForm()
  nextTick(() => {
    derivativeStore.resetSubaccount()
    spotStore.resetSubaccount()
    refetchData()
  })
}

function setTabFromQuery() {
  const { query } = route

  const activityTab = (
    typeof query.tab === 'string' ? query.tab.trim().toLowerCase() : query.tab
  ) as ActivityTab

  if (activityTab && Object.values(ActivityTab).includes(activityTab)) {
    tab.value = activityTab
  }
}

watch(
  () => tab.value,
  () => {
    switch (tab.value) {
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
  },
  { immediate: true }
)

watch(() => route.query, setTabFromQuery, { immediate: true })
</script>

<template>
  <PartialsActivitySubaccounts @update:subaccount="onSubaccountChange" />

  <div class="pt-6 h-full-flex">
    <PartialsActivityCommonNavigation
      v-model:tab="tab"
      :status="status"
      @update:tab="onTabChange"
    />

    <div class="mt-4 pt-4 pb-8 sm:pb-0 xs:mt-6 xs:pt-6 border-t" />

    <PartialsActivityCommonTabs
      v-model:view="view"
      class="pb-4 xs:pb-6"
      :tab="tab"
      @update:view="onViewChange"
      @update:subaccount="onSubaccountChange"
    />

    <div class="h-full rounded-xl overflow-y-auto">
      <CommonCard md class="h-full-flex">
        <div class="h-full-flex">
          <PartialsActivityCommonViewWrapper
            ref="filterRef"
            :tab="tab"
            :view="view"
            :status="status"
            @update:filter="handleFilterChange"
            @reset:filter="onViewChange"
          />

          <PartialsActivityCommonPagination
            v-if="
              ![
                ActivityView.Positions,
                ActivityView.SpotOrders,
                ActivityView.WalletDeposits,
                ActivityView.DerivativeOrders,
                ActivityView.WalletWithdrawals,
                ActivityView.DerivativeTriggers
              ].includes(view)
            "
            ref="paginationRef"
            :view="view"
            :status="status"
            @update:filter="fetchData"
          />
        </div>
      </CommonCard>
    </div>
  </div>

  <ModalsAddMargin />
</template>
