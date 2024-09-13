<script lang="ts" setup>
import { Wallet } from '@injectivelabs/wallet-ts'
import { Status } from '@injectivelabs/utils'
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

const view = ref<View>(View.Connect)
const isLocked = ref(false)

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

  if (route.query.liteBridge === 'true') {
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
  () => [sharedWalletStore.isUserConnected, portfolioStatus.isLoading()],
  ([isConnected, isLoading]) => {
    if (isConnected && !isLoading) {
      checkOnboarding()
    }
  }
)
</script>

<template>
  <LayoutWalletDetails v-if="sharedWalletStore.isUserConnected" />

  <AppButton
    v-else
    :data-cy="dataCyTag(NavBarCyTags.WalletConnectButton)"
    @click="onWalletConnect"
  >
    {{ $t('connect.connectWallet') }}
  </AppButton>

  <AppModal
    :is-md="view === View.Connect"
    :is-sm="view === View.FiatOnboard || view === View.LiteBridge"
    is-transparent
    :is-open="isModalOpen"
    :is-always-open="isLocked"
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
