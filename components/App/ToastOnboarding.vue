<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { getBridgeUrl } from '@shared/utils/network'
import { MAX_TOAST_TIMEOUT } from '@/app/utils/constants'
import {
  trackOnboardingUserDoesntTrade,
  trackOnboardingUserWithNoAssets,
  trackOnboardingWalletEmptyWithEvmAssets
} from '@/app/providers/mixpanel/EventTracker'
import { Modal, MainPage, CtaToast, BusEvents } from '@/types'

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
      isBridgeClicked: false,
      walletType: sharedWalletStore.wallet
    })

    return
  }

  if (
    !checkUserHasAssetsOnChain() &&
    !appStore.userState.dontShowAgain?.includes(CtaToast.UserWithNoAssets)
  ) {
    notificationStore.info({
      title: t('toast.portfolio.startTradingInSeconds'),
      description: t('toast.portfolio.getCryptoWithFiat'),
      timeout: MAX_TOAST_TIMEOUT,
      key: CtaToast.UserWithNoAssets,
      actions: [
        {
          label: t('toast.portfolio.buyCrypto'),
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
      isBuyCryptoClicked: false,
      walletType: sharedWalletStore.wallet
    })

    return
  }

  if (
    checkUserHasAssetsOnChain() &&
    !(await checkUserHasTraded()) &&
    route.name !== MainPage.Markets &&
    !appStore.userState.dontShowAgain?.includes(CtaToast.UserDoesntTrade)
  ) {
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
      isPopupShown: true,
      isTradeClicked: false
    })

    return
  }
})

onWalletDisconnected(() => {
  Object.values(CtaToast).forEach((key) => {
    const selectedNotification = notificationStore.notifications.find(
      (notification) => notification.key === key
    )

    if (selectedNotification) {
      notificationStore.clear(selectedNotification.id)
    }
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
</script>

<template>
  <div />
</template>
