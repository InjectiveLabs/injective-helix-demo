<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { getBridgeUrl } from '@shared/utils/network'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { MAX_TOAST_TIMEOUT } from '@/app/utils/constants'
import {
  trackUtmStockTwitsToast,
  trackOnboardingUserDoesntTrade,
  trackOnboardingUserWithNoAssets,
  trackOnboardingWalletEmptyWithEvmAssets
} from '@/app/providers/mixpanel/EventTracker'
import { Modal, MainPage, CtaToast, BusEvents, UtmSource } from '@/types'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const spotStore = useSpotStore()
const accountStore = useAccountStore()
const modalStore = useSharedModalStore()
const derivativeStore = useDerivativeStore()
const sharedWalletStore = useSharedWalletStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()

onMounted(async () => {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  if (
    (await checkUserHasTradableAssetsOnEvm()) &&
    !appStore.userState.dontShowAgain?.includes(
      CtaToast.WalletEmptyWithEvmAssets
    )
  ) {
    showMoveAssetsToInjToast()

    return
  }

  if (
    !checkUserHasAssetsOnChain() &&
    !appStore.userState.dontShowAgain?.includes(CtaToast.UserWithNoAssets)
  ) {
    showGetCryptoToast()

    return
  }

  if (
    checkUserHasAssetsOnChain() &&
    !(await checkUserHasTraded()) &&
    route.name !== MainPage.Markets &&
    !appStore.userState.dontShowAgain?.includes(CtaToast.UserDoesntTrade)
  ) {
    showStartTradingToast()

    return
  }
})

onWalletConnected(async () => {
  if (route.query.utm_source === UtmSource.StockTwits) {
    if (!sharedWalletStore.isUserConnected) {
      showStockTwitsToast()

      return
    }

    const selectedNotification = notificationStore.notifications.find(
      (notification) => notification.key === CtaToast.StockTwits
    )

    notificationStore.clear(selectedNotification?.id || 0)
  }
})

onWalletDisconnected(() => {
  Object.values(CtaToast).forEach((key) => {
    if (key === CtaToast.StockTwits) {
      return
    }

    const selectedNotification = notificationStore.notifications.find(
      (notification) => notification.key === key
    )

    notificationStore.clear(selectedNotification?.id || 0)
  })
})

function checkUserHasAssetsOnChain() {
  return accountStore.hasBalance
}

async function checkUserHasTradableAssetsOnEvm() {
  if (sharedWalletStore.wallet !== Wallet.Metamask || accountStore.hasBalance) {
    return false
  }

  await accountStore.fetchErc20Balances()

  return Object.keys(accountStore.erc20BalancesMap).length
}

async function checkUserHasTraded() {
  await spotStore.fetchSubaccountOrderHistory({
    pagination: {
      skip: 0,
      limit: 10
    }
  })

  await derivativeStore.fetchSubaccountOrderHistory({
    pagination: {
      skip: 0,
      limit: 10
    }
  })

  const hasTransactions =
    !!spotStore.subaccountOrderHistory.length ||
    !!derivativeStore.subaccountOrderHistory.length

  return hasTransactions
}

function showMoveAssetsToInjToast() {
  const isUsdtExist = accountStore.erc20BalancesMap[usdtToken.denom]

  notificationStore.info({
    title: t('toast.portfolio.moveAssetsToInjTitle'),
    description: t('toast.portfolio.moveAssetsToInj'),
    timeout: MAX_TOAST_TIMEOUT,
    key: CtaToast.WalletEmptyWithEvmAssets,
    actions: [
      {
        label: t('toast.portfolio.bridgeNow'),
        callback: () => {
          if (isUsdtExist) {
            modalStore.openModal(Modal.LiteBridge)
          } else {
            window.open(getBridgeUrl(), '_blank')
          }

          trackOnboardingWalletEmptyWithEvmAssets({
            isPopupShown: true,
            isBridgeClicked: true,
            walletType: sharedWalletStore.wallet
          })
        }
      }
    ]
  })

  trackOnboardingWalletEmptyWithEvmAssets({
    isPopupShown: true,
    walletType: sharedWalletStore.wallet
  })
}

function showGetCryptoToast() {
  notificationStore.info({
    title: t('toast.portfolio.startTradingInSeconds'),
    description: t('toast.portfolio.topUpWithCreditOrDebit'),
    timeout: MAX_TOAST_TIMEOUT,
    key: CtaToast.UserWithNoAssets,
    actions: [
      {
        label: t('toast.portfolio.buyInj'),
        callback: () => {
          modalStore.openModal(Modal.FiatOnboard)

          useEventBus(BusEvents.OpenOnramper).emit()

          trackOnboardingUserWithNoAssets({
            isPopupShown: true,
            isBuyCryptoClicked: true,
            walletType: sharedWalletStore.wallet
          })
        }
      }
    ]
  })

  trackOnboardingUserWithNoAssets({
    isPopupShown: true,
    walletType: sharedWalletStore.wallet
  })
}

function showStartTradingToast() {
  notificationStore.info({
    title: t('toast.portfolio.readyToTrade'),
    description: t('toast.portfolio.discoverTrendingPairs'),
    timeout: MAX_TOAST_TIMEOUT,
    key: CtaToast.UserDoesntTrade,
    actions: [
      {
        label: t('toast.portfolio.tradeNow'),
        callback: () => {
          router.push({ name: MainPage.Markets })

          trackOnboardingUserDoesntTrade({
            isPopupShown: true,
            isTradeClicked: true
          })
        }
      }
    ]
  })

  trackOnboardingUserDoesntTrade({
    isPopupShown: true
  })
}

function showStockTwitsToast() {
  const routeQuery = route.query

  notificationStore.info({
    title: t('toast.stockTwits.title'),
    description: t('toast.stockTwits.description'),
    timeout: MAX_TOAST_TIMEOUT,
    key: CtaToast.StockTwits,
    actions: [
      {
        label: t('toast.stockTwits.startHere'),
        callback: () => {
          if (
            GEO_IP_RESTRICTIONS_ENABLED &&
            !appStore.userState.hasAcceptedTerms
          ) {
            modalStore.openModal(Modal.Terms)
          } else {
            modalStore.openModal(Modal.Connect)
          }

          trackUtmStockTwitsToast({
            isPopupShown: true,
            isCtaClicked: true,
            walletType: sharedWalletStore.wallet,
            utmMedium: routeQuery?.utm_medium as string,
            utmCampaign: routeQuery?.utm_campaign as string,
            utmSourcePlatform: routeQuery?.utm_source_platform as string
          })
        }
      }
    ]
  })

  trackUtmStockTwitsToast({
    isPopupShown: true,
    walletType: sharedWalletStore.wallet,
    utmMedium: routeQuery?.utm_medium as string,
    utmCampaign: routeQuery?.utm_campaign as string,
    utmSourcePlatform: routeQuery?.utm_source_platform as string
  })
}
</script>

<template>
  <div />
</template>
