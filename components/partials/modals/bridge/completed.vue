<template>
  <v-modal :is-open="isModalOpen" md @modal-closed="handleModalClose">
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
              v-if="bridgeType === BridgeType.Transfer"
              lg
              primary
              class="w-full xs:w-1/2 font-bold"
            >
              <a
                :href="explorerUrl"
                target="_blank"
                class="flex items-center justify-center"
              >
                <span class="mr-2">{{ $t('bridge.seeOnExplorer') }}</span>
                <v-icon-external-link class="w-3 h-3" />
              </a>
            </v-button>
            <v-button v-else lg primary class="w-full xs:w-1/2 font-bold">
              <a
                :href="hubUrl"
                target="_blank"
                class="flex items-center justify-center"
              >
                <span class="mr-2">{{ $t('bridge.trackTransaction') }}</span>
                <v-icon-external-link class="w-3 h-3" />
              </a>
            </v-button>
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
import { getExplorerUrl } from '@injectivelabs/ui-common'
import { Modal, BridgeType } from '~/types/enums'
import VIbcTransferNote from '~/components/partials/funding/bridge/ibc-transfer-note.vue'
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
