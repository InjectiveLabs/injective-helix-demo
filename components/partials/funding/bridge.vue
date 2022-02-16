<template>
  <div>
    <v-modal-bridge
      v-bind="{ form, bridgeType, transferDirection, bridgingNetwork }"
      @input-amount:update="handleAmountUpdate"
      @input-token:update="handleTokenUpdate"
      @transfer-direction:update="handleTransferDirectionUpdate"
      @bridge-type:update="handleBridgeTypeUpdate"
      @bridging-network:update="handleBridgingNetworkUpdate"
    />
    <v-modal-bridge-confirm
      v-bind="{ form, bridgeType, transferDirection, bridgingNetwork }"
    />
    <v-modal-bridge-success
      v-bind="{ form, bridgeType, transferDirection, bridgingNetwork }"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BridgingNetwork, Token } from '@injectivelabs/ui-common'
import { injToken } from '~/app/data/token'
import { BridgeType, Modal, TransferDirection } from '~/types'
import VModalBridge from '~/components/partials/modals/bridge/index.vue'
import VModalBridgeConfirm from '~/components/partials/modals/bridge/confirm.vue'
import VModalBridgeSuccess from '~/components/partials/modals/bridge/success.vue'

export default Vue.extend({
  components: {
    VModalBridge,
    VModalBridgeConfirm,
    VModalBridgeSuccess
  },

  data() {
    return {
      bridgeType: BridgeType.Transfer,
      BridgeType,

      transferDirection: TransferDirection.bankToTradingAccount,
      TransferDirection,

      bridgingNetwork: BridgingNetwork.Ethereum,
      BridgingNetwork,

      form: {
        token: injToken,
        amount: ''
      }
    }
  },

  methods: {
    handleAmountUpdate(amount: string) {
      this.form.amount = amount
    },

    handleTokenUpdate(token: Token) {
      this.form.token = token
    },

    handleBridgeTypeUpdate(bridgeType: BridgeType) {
      this.bridgeType = bridgeType
    },

    handleBridgingNetworkUpdate(bridgingNetwork: BridgingNetwork) {
      this.bridgingNetwork = bridgingNetwork
    },

    handleTransferDirectionUpdate(transferDirection: TransferDirection) {
      this.transferDirection = transferDirection
    },

    handleCloseModal() {
      this.$accessor.modal.closeModal(Modal.Bridge)
    }
  }
})
</script>
