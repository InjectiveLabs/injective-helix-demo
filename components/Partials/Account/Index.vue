<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { AccountBalance, BusEvents, Modal, TabOption } from '@/types'

defineProps({
  balances: {
    type: Array as PropType<AccountBalance[]>,
    required: true
  }
})

const route = useRoute()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const bankStore = useBankStore()
const derivativeStore = useDerivativeStore()
const positionStore = usePositionStore()
const { $onError } = useNuxtApp()

const components = {
  Balances: 'Balances',
  Positions: 'Positions'
}

const tabs = [
  {
    value: components.Balances,
    label: 'account.tabs.balances',
    url: 'balances'
  },
  {
    value: components.Positions,
    label: 'account.tabs.positions',
    url: 'positions'
  }
] as TabOption[]

const status = reactive(new Status(StatusType.Loading))
const activeView = ref(tabs[0])
const hideBalances = ref(false)

onMounted(() => {
  handleViewFromRoute()
  initBalances()

  useEventBus(BusEvents.FundingRefresh).on(() => refreshBalances())
})

onBeforeUnmount(() => {
  modalStore.closeModal(Modal.AssetDetails)
})

function initBalances() {
  handleViewFromRoute()

  Promise.all([
    tokenStore.getErc20TokensWithBalanceAndPriceFromBankAndMarkets(),
    accountStore.fetchSubaccountsBalancesWithPrices(),
    positionStore.fetchSubaccountPositions(),
    accountStore.streamSubaccountBalances(),
    positionStore.streamSubaccountPositions()
  ])
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleHideBalances(value: boolean) {
  hideBalances.value = value
}

function handleTab(tab: TabOption) {
  activeView.value = tab
}

function handleViewFromRoute() {
  const tab = tabs.find((tab) => tab.url === route.query.view)

  if (tab) {
    activeView.value = tab
  }
}

function refreshBalances() {
  Promise.all([
    accountStore.fetchSubaccountsBalancesWithPrices(),
    bankStore.fetchBankBalancesWithToken(),
    derivativeStore.fetchSubaccountOrders(),
    positionStore.fetchSubaccountPositions() // refresh mark price
  ]).catch(() => {
    // silently fail
  })
}
</script>

<template>
  <div class="h-full-flex w-full flex-wrap">
    <AppHocLoading :status="status">
      <div class="container pt-6 pb-12">
        <div class="w-full mx-auto 3xl:w-11/12 4xl:w-10/12 flex flex-col">
          <h2 class="text-2xl text-white font-bold mb-4">
            {{ $t('account.accountOverview') }}
          </h2>

          <span class="text-gray-450 text-lg mb-1">
            {{ $t('account.netWorth') }}
          </span>

          <PartialsAccountOverview
            :balances="balances"
            :hide-balances="hideBalances"
            @update:hide-balances="handleHideBalances"
          />

          <PartialsAccountTabs
            :tabs="tabs"
            :value="activeView"
            @update:tab="handleTab"
          />

          <PartialsAccountBalances
            v-if="activeView.value === components.Balances"
            v-bind="{
              hideBalances,
              balances
            }"
          />

          <PartialsAccountPositions
            v-if="activeView.value === components.Positions"
            v-bind="{ hideBalances, balances }"
          />
        </div>
      </div>
    </AppHocLoading>

    <PartialsAccountBalancesAssetDetails
      v-if="modalStore.modals[Modal.AssetDetails]"
    />
    <PartialsAccountBridge />
    <ModalsAddMargin />
  </div>
</template>
