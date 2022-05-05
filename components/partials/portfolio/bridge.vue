<template>
  <div>
    <v-modal-bridge
      v-bind="{
        form,
        bridgeType,
        origin,
        destination,
        isIbcTransfer,
        transferDirection,
        bridgingNetwork
      }"
      @input-amount:update="handleAmountUpdate"
      @input-memo:update="handleMemoUpdate"
      @input-token:update="handleTokenUpdate"
      @input-destinationAddress:update="handleDestinationAddressUpdate"
      @transfer-direction:update="handleTransferDirectionUpdate"
      @bridge-type:update="handleBridgeTypeUpdate"
      @bridging-network:update="handleBridgingNetworkUpdate"
      @bridge:confirm="handleModalConfirmOpen"
      @bridge:reset="handleResetForm"
    />
    <v-modal-bridge-confirm
      v-bind="{
        form,
        bridgeType,
        origin,
        destination,
        isIbcTransfer,
        transferDirection,
        bridgingNetwork
      }"
      @bridge:confirmed="handleModalCompletedOpen"
    />
    <v-modal-bridge-completed
      v-bind="{
        bridgeType,
        destination,
        origin,
        isIbcTransfer
      }"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BridgingNetwork, KeplrNetworks, Token } from '@injectivelabs/ui-common'
import { Wallet } from '@injectivelabs/ts-types'
import { injToken } from '~/app/data/token'
import { BridgeType, Modal, TransferDirection } from '~/types'
import VModalBridge from '~/components/partials/modals/bridge/index.vue'
import VModalBridgeConfirm from '~/components/partials/modals/bridge/confirm.vue'
import VModalBridgeCompleted from '~/components/partials/modals/bridge/completed.vue'
import { getBridgingNetworkBySymbol } from '~/app/data/bridge'
import { tokenService } from '~/app/Services'

export default Vue.extend({
  components: {
    VModalBridge,
    VModalBridgeConfirm,
    VModalBridgeCompleted
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
        amount: '',
        memo: '',
        destinationAddress: ''
      }
    }
  },

  computed: {
    wallet(): Wallet {
      return this.$accessor.wallet.wallet
    },

    origin(): BridgingNetwork | TransferDirection {
      const { bridgeType, bridgingNetwork } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.transferDirection
      }

      if (bridgeType === BridgeType.Withdraw) {
        return BridgingNetwork.Injective
      }

      // Deposit
      return bridgingNetwork
    },

    destination(): BridgingNetwork | TransferDirection {
      const { bridgeType, bridgingNetwork } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.transferDirection === TransferDirection.bankToTradingAccount
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
      }

      if (bridgeType === BridgeType.Deposit) {
        return BridgingNetwork.Injective
      }

      // Withdraw
      return bridgingNetwork
    },

    isIbcTransfer(): boolean {
      const { origin, destination } = this

      const cosmosNetworks = [...KeplrNetworks, BridgingNetwork.Terra]

      return (
        cosmosNetworks.includes(origin as BridgingNetwork) ||
        cosmosNetworks.includes(destination as BridgingNetwork)
      )
    }
  },

  mounted() {
    this.$root.$on('bridge:transfer', this.handleTransfer)
    this.$root.$on('bridge:transfer-to-bank', this.handleTransferToBank)
    this.$root.$on('bridge:deposit', this.handleDeposit)
    this.$root.$on('bridge:withdraw', this.handleWithdraw)
    this.$root.$on('bridge:reset', this.handleResetForm)

    this.handleQueryParams()
    this.handlePreFillKeplrWallet()
  },

  beforeDestroy() {
    this.$root.$off('bridge:transfer', this.handleTransfer)
    this.$root.$off('bridge:transfer-to-bank', this.handleTransferToBank)
    this.$root.$off('bridge:deposit', this.handleDeposit)
    this.$root.$off('bridge:withdraw', this.handleWithdraw)
    this.$root.$off('bridge:reset', this.handleResetForm)
  },

  methods: {
    handleQueryParams() {
      const { denom, bridgeType } = this.$route.query as {
        denom: string
        bridgeType: BridgeType
      }

      if (!denom || !bridgeType) {
        return
      }

      tokenService.getDenomToken(denom).then((token) => {
        if (!token) {
          return
        }

        this.form.token = token
        this.form.amount = ''
        this.form.memo = ''
        this.form.destinationAddress = ''
        this.bridgeType = bridgeType
        this.$accessor.modal.openModal(Modal.Bridge)
      })
    },

    handlePreFillKeplrWallet() {
      const { wallet } = this

      if (wallet === Wallet.Keplr) {
        this.bridgingNetwork = BridgingNetwork.CosmosHub
      }
    },

    handleModalBridgeOpen() {
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleModalConfirmOpen() {
      this.$accessor.modal.openModal(Modal.BridgeConfirm)
    },

    handleModalCompletedOpen() {
      this.$accessor.modal.openModal(Modal.BridgeCompleted)
    },

    handleAmountUpdate(amount: string) {
      this.form.amount = amount.toString()
    },

    handleMemoUpdate(memo: string) {
      this.form.memo = memo || ''
    },

    handleTokenUpdate(token: Token) {
      this.form.amount = ''
      this.form.token = token
    },

    handleDestinationAddressUpdate(address: string) {
      this.form.destinationAddress = address
    },

    handleBridgeTypeUpdate(bridgeType: BridgeType) {
      this.bridgeType = bridgeType
    },

    handleBridgingNetworkUpdate(bridgingNetwork: BridgingNetwork) {
      this.bridgingNetwork = bridgingNetwork
    },

    handleTransferDirectionUpdate(transferDirection: TransferDirection) {
      this.form.amount = ''
      this.transferDirection = transferDirection
    },

    handleResetForm() {
      this.form.token = injToken
      this.form.amount = ''
      this.form.memo = ''
      this.form.destinationAddress = ''
      this.bridgeType = BridgeType.Transfer
    },

    handleTransfer(token: Token) {
      this.form.amount = ''
      this.form.memo = ''
      this.form.destinationAddress = ''
      this.form.token = token || injToken
      this.bridgeType = BridgeType.Transfer
      this.transferDirection = TransferDirection.bankToTradingAccount
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleTransferToBank(token: Token) {
      this.form.amount = ''
      this.form.memo = ''
      this.form.destinationAddress = ''
      this.form.token = token || injToken
      this.bridgeType = BridgeType.Transfer
      this.transferDirection = TransferDirection.tradingAccountToBank
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleDeposit(token: Token) {
      const { wallet } = this
      const formToken = token || injToken

      this.form.amount = ''
      this.form.memo = ''
      this.form.destinationAddress = ''
      this.form.token = formToken
      this.bridgingNetwork =
        wallet === Wallet.Keplr
          ? BridgingNetwork.CosmosHub
          : getBridgingNetworkBySymbol(formToken.symbol)
      this.bridgeType = BridgeType.Deposit
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleWithdraw(token: Token) {
      const { wallet } = this
      const formToken = token || injToken

      this.form.amount = ''
      this.form.memo = ''
      this.form.destinationAddress = ''
      this.form.token = formToken
      this.bridgingNetwork =
        wallet === Wallet.Keplr
          ? BridgingNetwork.Injective
          : getBridgingNetworkBySymbol(formToken.symbol)
      this.bridgeType = BridgeType.Withdraw
      this.$accessor.modal.openModal(Modal.Bridge)
    }
  }
})
</script>
