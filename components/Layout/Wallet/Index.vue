<script lang="ts" setup>
import { dataCyTag } from '@shared/utils'
import { Status } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-ts'
import { WalletConnectStatus } from '@shared/types'
import { GEO_IP_RESTRICTIONS_ENABLED } from '@shared/utils/constant'
import { usdtToken } from '@shared/data/token'
import { isCountryRestricted } from '@/app/data/geoip'
import { Modal, NavBarCyTags, PortfolioStatusKey } from '@/types'

enum View {
  Connect = 'connect',
  LiteBridge = 'liteBridge',
  FiatOnboard = 'fiatOnboard'
}

const route = useRoute()
const modalStore = useModalStore()
const accountStore = useAccountStore()
const sharedGeoStore = useSharedGeoStore()
const sharedWalletStore = useSharedWalletStore()

const portfolioStatus = inject(PortfolioStatusKey) as Status

const isLocked = ref(false)
const view = ref<View>(View.Connect)

const isModalOpen = computed<boolean>(() => modalStore.modals[Modal.Connect])

function onWalletConnect() {
  if (GEO_IP_RESTRICTIONS_ENABLED) {
    modalStore.openModal(Modal.Terms)
  } else {
    modalStore.openModal(Modal.Connect)
  }
}

function onModalOpen() {
  if (!GEO_IP_RESTRICTIONS_ENABLED) {
    return
  }

  if (isCountryRestricted(sharedGeoStore.country)) {
    modalStore.closeModal(Modal.Connect)
    modalStore.openModal(Modal.GeoRestricted)
  }
}

function onCloseModal() {
  modalStore.closeModal(Modal.Connect)
  view.value = View.Connect
}

function checkOnboarding() {
  if (!sharedWalletStore.isUserConnected) {
    return
  }

  if (route.query.bridge === 'true') {
    view.value = View.LiteBridge

    return
  }

  const erc20UsdtBalance = accountStore.erc20BalancesMap[usdtToken.denom]

  if (
    sharedWalletStore.isUserConnected &&
    !accountStore.hasBalance &&
    sharedWalletStore.wallet === Wallet.Metamask &&
    Number(erc20UsdtBalance?.balance || 0) > 0
  ) {
    view.value = View.LiteBridge

    return
  }

  if (!accountStore.hasBalance) {
    view.value = View.FiatOnboard

    return
  }

  onCloseModal()
}

function onLock() {
  isLocked.value = true
}

function onUnlock() {
  isLocked.value = false
}

watch(
  () => [
    sharedWalletStore.isUserConnected,
    portfolioStatus.isLoading(),
    isModalOpen.value
  ],
  ([isConnected, isLoading, isModalOpen]) => {
    if (isConnected && !isLoading && isModalOpen) {
      checkOnboarding()
    }
  }
)
</script>

<template>
  <LayoutWalletDetails v-if="sharedWalletStore.isUserConnected" />

  <AppButton
    v-else
    class="min-w-[110px] md:min-w-[160px]"
    :data-cy="dataCyTag(NavBarCyTags.WalletConnectButton)"
    :is-loading="
      sharedWalletStore.walletConnectStatus === WalletConnectStatus.connecting
    "
    @click="onWalletConnect"
  >
    <span class="md:hidden">{{ $t('connect.connect') }}</span>
    <span class="max-md:hidden">{{ $t('connect.connectWallet') }}</span>
  </AppButton>

  <AppModal
    v-bind="{
      isTransparent: true,
      isOpen: isModalOpen,
      isAlwaysOpen: isLocked,
      isMd: view === View.Connect,
      isSm: view === View.FiatOnboard || view === View.LiteBridge
    }"
    @modal:open="onModalOpen"
    @modal:closed="onCloseModal"
  >
    <AppHocLoading v-bind="{ status: portfolioStatus }">
      <LayoutWalletConnect v-if="view === View.Connect" />

      <LayoutWalletFiatOnboard
        v-if="view === View.FiatOnboard"
        @modal:close="onCloseModal"
      />

      <LayoutWalletLiteBridge
        v-if="view === View.LiteBridge"
        @modal:lock="onLock"
        @modal:unlock="onUnlock"
      />
    </AppHocLoading>
  </AppModal>

  <ModalsTerms />
</template>
