<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-ts'
import { WalletConnectStatus } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { BANNER_NOTICE_ENABLED } from '@/app/utils/constants'
import { mixpanelAnalytics } from '@/app/providers/mixpanel/BaseTracker'
import {
  Modal,
  MainPage,
  PortfolioStatusKey,
  LiquidityRewardsPage
} from '@/types'

const route = useRoute()
const authZStore = useAuthZStore()
const modalStore = useModalStore()
const accountStore = useAccountStore()
const positionStore = usePositionStore()
const exchangeStore = useExchangeStore()
const sharedWalletStore = useSharedWalletStore()
const { $onError } = useNuxtApp()

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

/**
 * Post only mode modal when we do chain upgrade
watch(
  () => appStore.blockHeight,
  () => {
    if (
      appStore.blockHeight >= MAINNET_UPGRADE_BLOCK_HEIGHT &&
      appStore.blockHeight <=
        MAINNET_UPGRADE_BLOCK_HEIGHT + POST_ONLY_MODE_BLOCK_THRESHOLD
    ) {
      modalStore.openModal(Modal.PostOnlyMode)
    }
  }
)
 */

onWalletConnected(() => {
  portfolioStatus.setLoading()

  mixpanelAnalytics.init()

  fetchUserPortfolio()
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
    exchangeStore.initFeeDiscounts(),
    authZStore.fetchGrants(),

    accountStore.fetchCw20Balances(),
    accountStore.fetchErc20Balances(),
    accountStore.fetchAccountPortfolioBalances(),

    positionStore.fetchPositions()
  ])
}

function fetchSubaccountStream() {
  accountStore.cancelSubaccountBalanceStream()
  accountStore.cancelBankBalanceStream()
  positionStore.cancelSubaccountPositionsStream()

  accountStore.streamSubaccountBalance()
  accountStore.streamBankBalance()
  positionStore.streamSubaccountPositions()
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
    sharedWalletStore.isUserConnected &&
    !accountStore.hasBalance &&
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
</script>

<template>
  <div class="relative">
    <LayoutNavbar />
    <main class="relative pb-6">
      <LayoutAuthZBanner v-if="sharedWalletStore.isAuthzWalletConnected" />
      <LayoutBanner v-else-if="!BANNER_NOTICE_ENABLED" />
      <ModalsCompetitionWinner
        v-if="
          sharedWalletStore.isUserConnected &&
          sharedWalletStore.walletConnectStatus !==
            WalletConnectStatus.disconnecting
        "
      />

      <slot v-bind="{ portfolioStatus }" />
    </main>

    <ModalsNinjaPassWinner />
    <!-- hide survey for now but can be resurrected and modified for future surveys -->
    <!-- <ModalsUserFeedback /> -->
    <!-- <ModalsNewFeature /> -->

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

    <SharedNotifications
      class="z-[1110] fixed inset-0 flex flex-col gap-2 justify-end items-end p-6 pointer-events-none"
    >
      <template #default="{ notification }">
        <SharedNotification
          :notification="notification"
          class="pointer-events-auto bg-brand-900"
          wrapper-class="bg-brand-900 border-brand-700 border"
        >
          <template #close="{ closeNotification }">
            <SharedIcon
              name="close-bold"
              class="min-w-4 hover:text-blue-500 text-white w-4 h-4"
              @click="closeNotification"
            />
          </template>
        </SharedNotification>
      </template>
    </SharedNotifications>

    <CommonAutoSignExpiredToast />
  </div>
</template>
