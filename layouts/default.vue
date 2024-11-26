<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { NuxtUiIcons, WalletConnectStatus } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { BANNER_NOTICE_ENABLED } from '@/app/utils/constants'
import { mixpanelAnalytics } from '@/app/providers/mixpanel/BaseTracker'
import {
  Modal,
  MainPage,
  TradeSubPage,
  InitialStatusKey,
  PortfolioStatusKey,
  LeaderboardSubPage,
  LiquidityRewardsPage
} from '@/types'

const route = useRoute()
const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const positionStore = usePositionStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

const initialStatus = inject(InitialStatusKey, new Status(StatusType.Loading))

const portfolioStatus = reactive(new Status(StatusType.Loading))

const isHomePage = computed(() => route.name === MainPage.Index)

const showFooter = computed(() =>
  [
    MainPage.Index,
    MainPage.Markets,
    MainPage.LpRewards,
    MainPage.FeeDiscounts,
    LiquidityRewardsPage.Dashboard,
    LiquidityRewardsPage.CampaignDetails
  ].includes(route.name as MainPage)
)

onWalletConnected(async () => {
  portfolioStatus.setLoading()

  mixpanelAnalytics.init()

  await until(initialStatus).toMatch((status) => status.isIdle())

  Promise.all([
    fetchUserPortfolio(),
    spotStore.fetchMarketsSummary(),
    derivativeStore.fetchMarketsSummary()
  ])
    .then(checkOnboarding)
    .catch($onError)
    .finally(() => {
      portfolioStatus.setIdle()
      fetchSubaccountStream()
    })
})

onSubaccountChange(() => {
  fetchSubaccountStream()
})

function fetchUserPortfolio() {
  return Promise.all([
    authZStore.fetchGrants(),
    exchangeStore.initFeeDiscounts(),

    accountStore.fetchCw20Balances(),
    accountStore.fetchErc20Balances(),
    accountStore.fetchAccountPortfolioBalances(),

    positionStore.fetchPositions(),
    gridStrategyStore.fetchStrategies()
  ])
}

function fetchSubaccountStream() {
  accountStore.cancelBankBalanceStream()
  accountStore.cancelSubaccountBalanceStream()
  positionStore.cancelAccountPositionsStream()

  accountStore.streamSubaccountBalance()
  positionStore.streamAccountPositions({
    onResetCallback: positionStore.fetchPositions
  })
  accountStore.streamBankBalance({
    onResetCallback: accountStore.fetchAccountPortfolioBalances
  })
}

function checkOnboarding() {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  if (route.query.bridge === 'true') {
    modalStore.openModal(Modal.LiteBridge)

    return
  }

  const erc20UsdtBalance = accountStore.erc20BalancesMap[usdtToken.denom]

  if (
    !accountStore.hasBalance &&
    sharedWalletStore.isUserConnected &&
    sharedWalletStore.wallet === Wallet.Metamask &&
    Number(erc20UsdtBalance?.balance || 0) > 0
  ) {
    modalStore.closeModal(Modal.Connect)
    modalStore.openModal(Modal.LiteBridge)

    return
  }

  if (!accountStore.hasBalance) {
    modalStore.closeModal(Modal.Connect)
    modalStore.openModal(Modal.FiatOnboard)
  }
}

provide(PortfolioStatusKey, portfolioStatus)

useIntervalFn(
  () =>
    Promise.all([
      spotStore.fetchMarketsSummary(),
      derivativeStore.fetchMarketsSummary()
    ]),
  30 * 1000
)
</script>

<template>
  <div
    :class="[
      'relative',
      [TradeSubPage.Futures, TradeSubPage.Spot].includes(
        route.name as TradeSubPage
      )
        ? 'min-h-vhMinusHeader'
        : 'min-h-screen'
    ]"
  >
    <LayoutNavbar />
    <AppHocLoading
      is-helix
      wrapper-class="h-screen"
      :is-loading="route.name !== MainPage.Index && initialStatus.isLoading()"
    >
      <main class="relative mt-[56px] pb-6">
        <div :class="{ 'w-full absolute top-0 z-[3]': isHomePage }">
          <LayoutAuthZBanner v-if="sharedWalletStore.isAuthzWalletConnected" />
          <LayoutBanner v-else-if="!BANNER_NOTICE_ENABLED" />

          <LayoutOwnYourAssetCompetitionBanner
            v-if="route.name !== LeaderboardSubPage.Competition"
          />
          <LayoutFTMPerpBanner />

          <template v-if="isHomePage">
            <AssetNoticeBanners class="relative z-[2]" />
            <!-- hide for launch -->
            <!-- <AssetKadoBanner /> -->
          </template>
        </div>

        <ModalsCompetitionWinner
          v-if="
            sharedWalletStore.isUserConnected &&
            sharedWalletStore.walletConnectStatus !==
              WalletConnectStatus.disconnecting
          "
        />

        <slot v-bind="{ portfolioStatus }" />
      </main>
    </AppHocLoading>

    <ModalsNinjaPassWinner />
    <!-- hide survey for now but can be resurrected and modified for future surveys -->
    <!-- <ModalsUserFeedback /> -->

    <ModalsNewFeature />
    <ModalsPostOnlyMode />
    <ModalsDevMode />
    <ModalsGeoRestricted />
    <SharedPageConfetti />

    <template
      v-if="
        sharedWalletStore.isUserConnected &&
        sharedWalletStore.walletConnectStatus !==
          WalletConnectStatus.disconnecting
      "
    >
      <ModalsOnboardingLiteBridge />
      <ModalsOnboardingFiat />
    </template>

    <ModalsDepositQrCode />

    <LayoutFooter v-if="showFooter" />
    <LayoutStatusBar />

    <div id="modals" />

    <SharedNotifications
      class="z-[1110] fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
    >
      <template #default="{ notification }">
        <SharedNotification
          :notification="notification"
          class="pointer-events-auto bg-brand-900"
          wrapper-class="bg-brand-900 border-brand-700 border"
        >
          <template v-if="notification.isTemplateString" #custom>
            <PartialsNotificationsCustom :title="notification.title" />
          </template>
          <template #close="{ closeNotification }">
            <UIcon
              :name="NuxtUiIcons.CloseBold"
              class="min-w-4 hover:text-blue-500 text-white w-4 h-4"
              @click="closeNotification"
            />
          </template>
        </SharedNotification>
      </template>
    </SharedNotifications>

    <UNotifications />

    <CommonAutoSignExpiredToast />
  </div>
</template>
