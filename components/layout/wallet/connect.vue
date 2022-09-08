<template>
  <div class="ml-4 flex items-center md:ml-6" data-cy="wallet-connect">
    <VButton
      md
      primary
      class="rounded-lg whitespace-nowrap h-8 lg:h-10 px-4 lg:px-8 bg-primary-500 hover:bg-primary-400 flex items-center"
      data-cy="header-wallet-connect-button"
      @click="handleWalletConnectClicked"
    >
      {{ $t('connect.connectWallet') }}
    </VButton>

    <VModal
      :is-open="isOpenConnectModal"
      md
      no-padding
      @modal-closed="isOpenConnectModal = false"
    >
      <h3 slot="title">
        {{ $t('connect.connectToWallet') }}
      </h3>
      <div class="relative mt-6">
        <HocLoading :status="status">
          <ul
            class="divide-y divide-gray-800 border-gray-700 rounded-lg overflow-hidden"
          >
            <Metamask />
            <Keplr />
            <Torus />
            <WalletConnect v-if="isStagingOrTestnetOrDevnet" />
            <Ledger @wallet-ledger-connecting="handleLedgerConnectingWallet" />
            <Trezor @wallet-trezor-connecting="handleTrezorConnectingWallet" />
          </ul>
        </HocLoading>
      </div>
    </VModal>
    <ModalTerms />
    <ModalLedger :is-open="isLedgerModalOpen" @closed="handleLedgerClosed" />
    <ModalTrezor :is-open="isTrezorModalOpen" @closed="handleTrezorClosed" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import { Wallet } from '@injectivelabs/wallet-ts'
import { FeeDiscountAccountInfo } from '@injectivelabs/sdk-ts'
import Metamask from './wallets/metamask.vue'
import Keplr from './wallets/keplr.vue'
import Ledger from './wallets/ledger.vue'
import Torus from './wallets/torus.vue'
import WalletConnect from './wallets/wallet-connect.vue'
import Trezor from './wallets/trezor.vue'
import ModalLedger from './wallets/ledger/index.vue'
import ModalTrezor from './wallets/trezor/index.vue'
import { Modal, WalletConnectStatus } from '~/types'
import {
  GEO_IP_RESTRICTIONS_ENABLED,
  IS_DEVNET,
  IS_STAGING,
  IS_TESTNET
} from '~/app/utils/constants'
import ModalTerms from '~/components/partials/modals/terms.vue'
import {
  submitWalletConnectClickedTrackEvent,
  submitWalletConnectedTrackEvent
} from '~/app/client/utils/amplitude'

export default Vue.extend({
  components: {
    ModalTerms,
    Metamask,
    Keplr,
    Torus,
    Ledger,
    Trezor,
    ModalLedger,
    WalletConnect,
    ModalTrezor
  },

  data() {
    return {
      status: new Status(),
      isOpenConnectModal: false,
      isLedgerModalOpen: false,
      isTrezorModalOpen: false
    }
  },

  computed: {
    walletConnectStatus(): WalletConnectStatus {
      return this.$accessor.wallet.walletConnectStatus
    },

    isStagingOrTestnetOrDevnet(): boolean {
      return IS_TESTNET || IS_DEVNET || IS_STAGING
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    feeDiscountAccountInfo(): FeeDiscountAccountInfo | undefined {
      return this.$accessor.exchange.feeDiscountAccountInfo
    },

    tierLevel(): number {
      const { feeDiscountAccountInfo } = this

      if (!feeDiscountAccountInfo) {
        return 0
      }

      return new BigNumberInBase(
        feeDiscountAccountInfo.tierLevel || 0
      ).toNumber()
    }
  },

  watch: {
    walletConnectStatus(newWalletConnectStatus: WalletConnectStatus) {
      switch (newWalletConnectStatus) {
        case WalletConnectStatus.connecting:
          this.handleConnectingWallet()
          break
        case WalletConnectStatus.disconnected:
          this.handleDisconnectedWallet()
          break
        case WalletConnectStatus.idle:
        case WalletConnectStatus.connected:
          this.handleConnectedWallet()
          break
      }
    }
  },

  mounted() {
    this.$root.$on('wallet-clicked', this.handleWalletConnectClicked)
    this.$root.$on('terms-confirmed', this.handleTermsConfirmed)
    this.$root.$on('connect-ledger', this.handleLedgerConnectingWallet)

    Promise.all([this.$accessor.wallet.isMetamaskInstalled()])
      .then(() => {
        //
      })
      .catch(this.$onError)
  },

  beforeDestroy() {
    this.$root.$off('wallet-clicked', this.handleWalletConnectClicked)
    this.$root.$off('terms-confirmed', this.handleTermsConfirmed)
    this.$root.$off('connect-ledger', this.handleLedgerConnectingWallet)
  },

  methods: {
    handleWalletConnectClicked() {
      submitWalletConnectClickedTrackEvent()

      if (GEO_IP_RESTRICTIONS_ENABLED) {
        this.$accessor.modal.openModal({ type: Modal.Terms })
      } else {
        this.isOpenConnectModal = true
      }
    },

    handleTermsConfirmed() {
      this.isOpenConnectModal = true
    },

    handleConnectingWallet() {
      this.status.setLoading()
    },

    handleConnectedWallet() {
      this.handleConnectedWalletTrack()
      this.$toast.success(this.$t('connect.successfullyConnected'))
      this.$emit('wallet-connected')
      this.$root.$emit('wallet-connected')
      this.status.setIdle()
      this.$nextTick(() => {
        this.isOpenConnectModal = false
        this.$accessor.modal.openPersistedModalIfExist()
      })
    },

    handleLedgerConnectingWallet() {
      this.isOpenConnectModal = false
      this.isLedgerModalOpen = true
    },

    handleLedgerClosed() {
      this.isLedgerModalOpen = false
      this.$accessor.modal.openPersistedModalIfExist()
    },

    handleTrezorConnectingWallet() {
      this.isOpenConnectModal = false
      this.isTrezorModalOpen = true
    },

    handleTrezorClosed() {
      this.isTrezorModalOpen = false
      this.$accessor.modal.openPersistedModalIfExist()
    },

    handleDisconnectedWallet() {
      this.status.setIdle()
    },

    handleConnectedWalletTrack() {
      submitWalletConnectedTrackEvent({
        tierLevel: this.tierLevel,
        address: this.injectiveAddress,
        wallet: this.wallet
      })
    }
  }
})
</script>
