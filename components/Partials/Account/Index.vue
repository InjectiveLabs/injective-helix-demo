<script lang="ts" setup>
import { INJ_COIN_GECKO_ID } from '@injectivelabs/sdk-ui-ts'
import { Status, StatusType } from '@injectivelabs/utils'
import { BTC_COIN_GECKO_ID } from '@/app/utils/constants'
import { BusEvents, MainPage, Modal, AccountSubPage } from '@/types'

const spotStore = useSpotStore()
const modalStore = useModalStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const derivativeStore = useDerivativeStore()
const { $onError } = useNuxtApp()

const isHideBalances = ref(false)
const status = reactive(new Status(StatusType.Loading))
const fetchPositionsStatus = reactive(new Status(StatusType.Loading))
const usdPriceStatus = reactive(new Status(StatusType.Loading))

const { accountBalancesWithToken: currentSubaccountBalances } = useBalance()

onMounted(() => {
  initBalances()

  useEventBus(BusEvents.FundingRefresh).on(refreshBalances)
})

onBeforeUnmount(() => {
  modalStore.closeModal(Modal.AssetDetails)
  spotStore.reset()
})

function initBalances() {
  Promise.all([derivativeStore.streamSubaccountOrders()])
    .catch($onError)
    .finally(() => {
      status.setIdle()

      refreshUsdTokenPrice()
    })

  Promise.all([
    derivativeStore.streamSubaccountOrders(),
    derivativeStore.streamMarketsMarkPrices(),
    positionStore.streamSubaccountPositions()
  ])

  Promise.all([
    positionStore.fetchSubaccountPositions(),
    accountStore.fetchAccountPortfolioUnrealizedPnL()
  ]).finally(() => {
    fetchPositionsStatus.setIdle()
  })
}

function refreshBalances() {
  Promise.all([derivativeStore.fetchSubaccountOrders()])
}

function refreshUsdTokenPrice() {
  const coinGeckoIdsList = [
    INJ_COIN_GECKO_ID,
    BTC_COIN_GECKO_ID,
    ...currentSubaccountBalances.value.map((b) => b.token.coinGeckoId)
  ]

  tokenStore
    .fetchTokensUsdPriceMap(coinGeckoIdsList)
    .catch($onError)
    .finally(() => usdPriceStatus.setIdle())
}

function onHideBalances(value: boolean) {
  isHideBalances.value = value
}

watch(
  () => accountStore.subaccountId,
  () => positionStore.fetchSubaccountPositions()
)

useIntervalFn(refreshUsdTokenPrice, 1000 * 30)
</script>

<template>
  <div class="pt-6 sm:pb-8">
    <div>
      <h2 class="text-2xl text-white font-bold mb-4">
        {{ $t('account.accountOverview') }}
      </h2>

      <span class="text-gray-300 text-md my-1">
        {{ $t('account.netWorth') }}
      </span>

      <PartialsAccountOverview
        :is-loading="status.isLoading() || usdPriceStatus.isLoading()"
        v-bind="{
          isHideBalances
        }"
        @update:hide-balances="onHideBalances"
      />

      <div class="h-full-flex">
        <CommonTabMenu>
          <CommonTabMenuLinkItem
            v-bind="{ to: { name: MainPage.Account } }"
            is-index
          >
            {{ $t('account.tabs.balances') }}
          </CommonTabMenuLinkItem>

          <CommonTabMenuLinkItem
            v-bind="{ to: { name: AccountSubPage.Positions } }"
          >
            {{ $t('account.tabs.positions') }}
          </CommonTabMenuLinkItem>
        </CommonTabMenu>

        <AppHocLoading :status="status">
          <NuxtPage
            v-bind="{
              usdPriceStatus,
              isHideBalances,
              balances: currentSubaccountBalances,
              isUnrealizedPnLLoading: fetchPositionsStatus.isLoading()
            }"
          />
        </AppHocLoading>
      </div>
    </div>

    <PartialsAccountBalancesAssetDetails
      v-if="modalStore.modals[Modal.AssetDetails]"
    />

    <ModalsAddMargin />
    <ModalsCreateSubaccount />
    <ModalsSubaccountTransfer />
  </div>
</template>
