<script lang="ts" setup>
import { usdtToken } from '@shared/data/token'
import { Wallet } from '@injectivelabs/wallet-base'
import { getBridgeUrl } from '@shared/utils/network'
import {
  trackOnboardingUserDoesntTrade,
  trackOnboardingUserWithNoAssets,
  trackOnboardingWalletEmptyWithEvmAssets
} from '@/app/providers/mixpanel/EventTracker'
import { Modal, MainPage } from '@/types'

const route = useRoute()
const router = useRouter()
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

  if (await checkUserHasTradableAssetsOnEvm()) {
    const isUsdtExist = accountStore.erc20BalancesMap[usdtToken.denom]

    notificationStore.info({
      title: t('toast.portfolio.moveAssetsToInjTitle'),
      description: t('toast.portfolio.moveAssetsToInj'),
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

  if (!checkUserHasAssetsOnChain()) {
    notificationStore.info({
      title: t('toast.portfolio.startTradingInSeconds'),
      description: t('toast.portfolio.buyCryptoInstantly'),
      actions: [
        {
          label: t('toast.portfolio.buyCrypto'),
          callback: () => {
            modalStore.openModal(Modal.FiatOnboard)

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

  if (!(await checkUserHasTraded()) && route.name !== MainPage.Markets) {
    notificationStore.info({
      title: t('toast.portfolio.readyToTrade'),
      description: t('toast.portfolio.discoverTrendingPairs'),
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
