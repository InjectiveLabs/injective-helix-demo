<template>
  <div class="ml-4 flex items-center md:ml-6">
    <v-button md primary @click="isOpenConnectModal = !isOpenConnectModal">
      {{ $t('connect') }}
    </v-button>

    <v-modal
      :is-open="isOpenConnectModal"
      @modal-closed="isOpenConnectModal = false"
    >
      <h3 slot="title">
        {{ $t('connect_to_wallet') }}
      </h3>
      <div class="relative mt-6">
        <HOCLoading :status="status">
          <ul class="divide-y divide-gray-800 border-gray-700 rounded-lg">
            <v-metamask />
            <v-ledger
              @wallet-ledger-connecting="handleLedgerConnectingWallet"
            />
            <li class="text-xs text-gray-300 px-4 py-2">
              <p class="text-center leading-4">
                * {{ $t('Trezor Connection Note') }}
              </p>
            </li>
            <li class="text-xs text-gray-300 px-4 py-2">
              <!-- eslint-disable vue/no-v-html -->
              <p
                class="text-center leading-4"
                v-html="$t('disclaimer_note')"
              ></p>
            </li>
          </ul>
        </HOCLoading>
      </div>
    </v-modal>
    <v-modal-ledger
      :is-open="isLedgerModalOpen"
      @closed="isLedgerModalOpen = false"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Status } from '@injectivelabs/utils'
import VMetamask from './wallets/metamask.vue'
import VLedger from './wallets/ledger.vue'
import VModalLedger from './wallets/ledger/index.vue'
import HOCLoading from '~/components/hoc/loading.vue'
import { WalletConnectStatus } from '~/types'

export default Vue.extend({
  components: {
    HOCLoading,
    VMetamask,
    VLedger,
    VModalLedger
  },

  data() {
    return {
      status: new Status(),
      isOpenConnectModal: false,
      isLedgerModalOpen: false
    }
  },

  computed: {
    walletConnectStatus(): WalletConnectStatus {
      return this.$accessor.wallet.walletConnectStatus
    }
  },

  watch: {
    walletConnectStatus(newWalletConnectStatus: WalletConnectStatus) {
      if (newWalletConnectStatus === WalletConnectStatus.connecting) {
        this.handleConnectingWallet()
      }

      if (newWalletConnectStatus === WalletConnectStatus.disconnected) {
        this.handleDisconnectedWallet()
      }

      if (
        [WalletConnectStatus.connected, WalletConnectStatus.idle].includes(
          newWalletConnectStatus
        )
      ) {
        this.handleConnectedWallet()
      }
    }
  },

  mounted() {
    this.$root.$on('wallet-clicked', this.handleWalletClicked)

    Promise.all([this.$accessor.wallet.isMetamaskInstalled()])
      .then(() => {
        //
      })
      .catch(this.$onError)
  },

  beforeDestroy() {
    this.$root.$off('wallet-clicked', this.handleWalletClicked)
  },

  methods: {
    handleWalletClicked() {
      this.isOpenConnectModal = true
    },

    handleConnectingWallet() {
      this.status.setLoading()
    },

    handleConnectedWallet() {
      this.$toast.success(this.$t('success_connect'))
      this.$emit('wallet-connected')
      this.status.setIdle()
      this.$nextTick(() => {
        this.isOpenConnectModal = false
      })
    },

    handleLedgerConnectingWallet() {
      this.isOpenConnectModal = false
      this.isLedgerModalOpen = true
    },

    handleDisconnectedWallet() {
      this.status.setIdle()
    }
  }
})
</script>
