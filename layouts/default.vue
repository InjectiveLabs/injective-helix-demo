<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { WalletConnectStatus } from '@shared/types'
import { Status, INJ_DENOM, StatusType } from '@injectivelabs/utils'
import { mixpanelAnalytics } from '@/app/providers/mixpanel/BaseTracker'
import {
  Modal,
  MainPage,
  TradeSubPage,
  InitialStatusKey,
  PortfolioStatusKey,
  LiquidityRewardsPage
} from '@/types'

const route = useRoute()
const router = useRouter()
const spotStore = useSpotStore()
const authZStore = useAuthZStore()
const jsonStore = useSharedJsonStore()
const accountStore = useAccountStore()
const referralStore = useReferralStore()
const modalStore = useSharedModalStore()
const positionStore = usePositionStore()
const exchangeStore = useExchangeStore()
const derivativeStore = useDerivativeStore()
const gridStrategyStore = useGridStrategyStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const { $onError } = useNuxtApp()
const { activeSubaccountTradableBalancesWithToken } = useBalance()

const initialStatus = inject(InitialStatusKey, new Status(StatusType.Loading))

const jsonStatus = reactive(new Status(StatusType.Loading))
const portfolioStatus = reactive(new Status(StatusType.Loading))

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

  if (!sharedWalletStore.isDev) {
    mixpanelAnalytics.init()
  }

  await until(initialStatus).toMatch((status) => status.isIdle())

  Promise.all([
    fetchUserPortfolio(),
    spotStore.fetchMarketsSummary(),
    referralStore.fetchUserReferrer(),
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

function onJsonLoaded() {
  jsonStatus.setIdle()
}

function fetchUserPortfolio() {
  return Promise.all([
    authZStore.fetchGrants(),
    exchangeStore.initFeeDiscounts(),

    accountStore.fetchCw20Balances(),
    accountStore.fetchErc20Balances(),
    accountStore.fetchSignerInjBalance(),
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

  if (
    !accountStore.hasBalance &&
    sharedWalletStore.isUserConnected &&
    sharedWalletStore.wallet === Wallet.Metamask &&
    Number(accountStore.erc20BalancesMap[usdtToken.denom]?.balance || 0) > 0
  ) {
    modalStore.closeModal(Modal.Connect)

    notificationStore.info({
      title: t('portfolio.moveAssetsToInjTitle'),
      description: t('portfolio.moveAssetsToInj'),
      actions: [
        {
          label: t('portfolio.bridgeNow'),
          callback: bridgeCrypto
        }
      ]
    })

    return
  }

  if (!accountStore.hasBalance) {
    modalStore.closeModal(Modal.Connect)

    notificationStore.info({
      title: t('portfolio.startTradingInSeconds'),
      description: t('portfolio.buyCryptoInstantly'),
      actions: [
        {
          label: t('portfolio.buyCrypto'),
          callback: buyCrypto
        }
      ]
    })
  }

  const hasNoTransactions =
    spotStore.subaccountTrades.length === 0 &&
    spotStore.subaccountOrderHistory.length === 0 &&
    derivativeStore.subaccountTrades.length === 0 &&
    derivativeStore.subaccountOrderHistory.length === 0

  if (
    !hasNoTransactions &&
    route.name !== MainPage.Markets &&
    activeSubaccountTradableBalancesWithToken.value.find(
      (token) => token.denom === INJ_DENOM
    )
  ) {
    notificationStore.info({
      title: t('portfolio.readyToTrade'),
      description: t('portfolio.discoverTrendingPairs'),
      actions: [
        {
          label: t('portfolio.tradeNow'),
          callback: tradeNow
        }
      ]
    })
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

watch(
  () => jsonStore.isMaintenanceMode,
  (status) => {
    if (status && route.name !== MainPage.Maintenance) {
      return navigateTo({ name: MainPage.Maintenance })
    }
  },
  { immediate: true }
)

function buyCrypto() {
  modalStore.openModal(Modal.FiatOnboard)
}

function bridgeCrypto() {
  modalStore.openModal(Modal.LiteBridge)
}

function tradeNow() {
  router.push({ name: MainPage.Markets })
}
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

    <PartialsHomeGradientBg v-if="route.name === MainPage.Index" />
    <LayoutBanner class="sticky top-[56px]" />

    <AppHocLoading
      is-helix
      wrapper-class="h-screen"
      :is-loading="
        route.name !== MainPage.Index &&
        (initialStatus.isLoading() || jsonStatus.isLoading())
      "
    >
      <main class="relative pb-6 pt-[56px] overflow-x-hidden">
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

    <ModalsNvidia />
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

    <LayoutFooter v-if="showFooter" />
    <LayoutStatusBar />

    <div id="modals" />

    <AppNotifications
      class="z-[1110] fixed top-0 right-0 flex flex-col gap-2 p-6 pointer-events-none"
    />

    <CommonAutoSignExpiredToast />
    <AppJsonPoll @on:loaded="onJsonLoaded" />
  </div>
</template>
