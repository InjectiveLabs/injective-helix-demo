<template>
  <v-modal :is-open="isModalOpen" sm @modal-closed="handleModalClose">
    <div slot="title">
      <h3>{{ bridgeTitle }}</h3>
    </div>

    <div>
      <div v-if="isUserWalletConnected">
        <div v-if="!isIbcTransfer">
          <h3 class="text-xl font-semibold mt-6">
            {{ $t('bridge.transactionConfirmed') }}
          </h3>
          <p class="text-base text-gray-100 mt-4">
            {{ bridgeNote }}
          </p>
          <div class="text-center mt-6">
            <v-button
              lg
              primary
              class="font-bold w-4xs"
              @click="handleModalClose"
            >
              {{ $t('common.ok') }}
            </v-button>

            <div class="mt-4 text-primary-500 cursor-pointer">
              <a
                v-if="isOnChainTransaction"
                :href="explorerUrl"
                target="_blank"
                class="flex items-center justify-center"
              >
                <span class="mr-2">{{ $t('bridge.seeOnExplorer') }}</span>
                <v-icon-external-link class="w-3 h-3" />
              </a>

              <a
                v-else
                :href="hubUrl"
                target="_blank"
                class="flex items-center justify-center"
              >
                <span class="mr-2">{{ $t('bridge.trackTransaction') }}</span>
                <v-icon-external-link class="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
        <v-ibc-transfer-note v-else />
      </div>
      <v-user-wallet-connect-warning v-else />
    </div>
  </v-modal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { BridgingNetwork, getExplorerUrl } from '@injectivelabs/ui-common'
import { Modal, BridgeType } from '~/types/enums'
import VIbcTransferNote from '~/components/partials/portfolio/bridge/ibc-transfer-note.vue'
import { injToken } from '~/app/data/token'
import { NETWORK } from '~/app/utils/constants'
import { getHubUrl } from '~/app/utils/helpers'

export default Vue.extend({
  components: {
    VIbcTransferNote
  },

  props: {
    bridgeType: {
      required: true,
      type: String as PropType<BridgeType>
    },

    origin: {
      required: true,
      type: String as PropType<BridgingNetwork>
    },

    destination: {
      required: true,
      type: String as PropType<BridgingNetwork>
    },

    isIbcTransfer: {
      required: true,
      type: Boolean
    }
  },

  data() {
    return {
      BridgeType
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    isOnChainTransaction(): boolean {
      const { bridgeType, destination } = this

      if (bridgeType === BridgeType.Transfer) {
        return true
      }

      if (
        bridgeType === BridgeType.Withdraw &&
        destination === BridgingNetwork.Injective
      ) {
        return true
      }

      return false
    },

    bridgeTitle(): string {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.$t('bridge.transferFromToTradingAccount')
      }

      if (bridgeType === BridgeType.Deposit) {
        return this.$t('bridge.depositToInjective')
      }

      // Withdraw
      return this.$t('bridge.withdrawFromInjective')
    },

    bridgeNote(): string {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.$t('bridge.defaultNote')
      }

      if (bridgeType === BridgeType.Deposit) {
        return this.$t('bridge.withdrawFromEthereumNote')
      }

      // Withdraw
      return this.$t('bridge.withdrawFromInjectiveNote')
    },

    hubUrl(): string {
      return `${getHubUrl()}/bridge`
    },

    explorerUrl(): string {
      const { injectiveAddress } = this

      return `${getExplorerUrl(NETWORK)}/account/${injectiveAddress}`
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.BridgeCompleted]
    }
  },

  methods: {
    handleModalClose() {
      this.$emit('input-token:update', injToken)
      this.$emit('input-amount:update', '')
      this.$accessor.modal.closeModal(Modal.BridgeCompleted)
    }
  }
})
</script>
