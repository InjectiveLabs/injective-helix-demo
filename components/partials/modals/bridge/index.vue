<template>
  <v-modal :is-open="isModalOpen" md @modal-closed="handleCloseModal">
    <div slot="title">
      <h3>{{ bridgeTitle }}</h3>
    </div>
    <ValidationObserver v-slot="{ invalid }" ref="form">
      <div>
        <v-transfer-direction-switch
          v-if="bridgeType === BridgeType.Transfer"
          v-bind="{ transferDirection }"
          @transfer-direction:switch="handleTransferDirectionSwitch"
        />
        <v-network-select
          v-else
          v-bind="{ value: bridgingNetwork }"
          @bridging-network:change="handleBridgingNetworkSwitch"
        >
          <template slot="title">{{ networkSelectorTitle }}</template>
        </v-network-select>
      </div>
      <div v-if="isUserWalletConnected">
        <template v-if="!isIbcTransfer">
          <h3 class="text-xl font-semibold mt-6">
            {{ bridgeNote }}
          </h3>
          <v-token-selector
            class="mt-6"
            :amount="form.amount"
            :value="form.token"
            :origin="origin"
            :destination="destination"
            :is-ibc-transfer="isIbcTransfer"
            :balance="balance"
            @input:amount="handleAmountChange"
            @input:token="handleTokenChange"
          >
          </v-token-selector>
          <v-balance :balance="balance" :token="form.token" />
          <div class="mt-6 text-center">
            <v-button
              lg
              primary
              class="w-full xs:w-1/2 font-bold"
              :disabled="invalid"
              @click="handleTransferNowClick"
            >
              {{ $t('bridge.transferNow') }}
            </v-button>
          </div>
        </template>
        <v-ibc-transfer-note v-else />
      </div>
      <v-user-wallet-connect-warning v-else />
    </ValidationObserver>
  </v-modal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver } from 'vee-validate'
import {
  BankBalanceWithToken,
  BridgingNetwork,
  KeplrNetworks,
  SubaccountBalanceWithToken,
  Token,
  TokenWithBalanceAndPrice,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { injToken } from '~/app/data/token'
import { BridgeType, Modal, TransferDirection } from '~/types'
import VTokenSelector from '~/components/partials/funding/bridge/token-selector/index.vue'
import VBalance from '~/components/partials/funding/bridge/balance.vue'
import VNetworkSelect from '~/components/partials/funding/bridge/network-select.vue'
import VIbcTransferNote from '~/components/partials/funding/bridge/ibc-transfer-note.vue'
import VTransferDirectionSwitch from '~/components/partials/funding/bridge/transfer-direction-switch.vue'

export default Vue.extend({
  components: {
    ValidationObserver,
    VTokenSelector,
    VNetworkSelect,
    VIbcTransferNote,
    VTransferDirectionSwitch,
    VBalance
  },

  props: {
    bridgeType: {
      required: true,
      type: String as PropType<BridgeType>
    },

    bridgingNetwork: {
      required: true,
      type: String as PropType<BridgingNetwork>
    },

    transferDirection: {
      required: true,
      type: String as PropType<TransferDirection>
    },

    form: {
      required: true,
      type: Object as PropType<{
        token: Token
        amount: string
      }>
    }
  },

  data() {
    return {
      BridgeType,
      TransferDirection,
      BridgingNetwork
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    erc20TokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.erc20TokensWithBalanceAndPriceFromBank
    },

    subaccountBalancesWithToken(): SubaccountBalanceWithToken[] {
      return this.$accessor.account.subaccountBalancesWithToken
    },

    bankBalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankErc20BalancesWithToken
    },

    ibcBankBalancesWithToken(): BankBalanceWithToken[] {
      return this.$accessor.bank.bankIbcBalancesWithToken
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

    networkSelectorTitle(): string {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Deposit) {
        return this.$t('bridge.selectOriginNetwork')
      }

      // Withdraw
      return this.$t('bridge.selectDestinationNetwork')
    },

    bridgeNote(): string {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.$t('bridge.selectTokenAndAmount')
      }

      if (bridgeType === BridgeType.Deposit) {
        return this.$t('bridge.selectTokenAndAmount')
      }

      // Withdraw
      return this.$t('bridge.selectTokenAndAmount')
    },

    onTransferBalance(): BigNumberInBase {
      const {
        form,
        bridgeType,
        transferDirection,
        subaccountBalancesWithToken,
        bankBalancesWithToken,
        ibcBankBalancesWithToken
      } = this

      if (bridgeType !== BridgeType.Transfer) {
        return ZERO_IN_BASE
      }

      if (transferDirection === TransferDirection.bankToTradingAccount) {
        const balances = [...bankBalancesWithToken, ...ibcBankBalancesWithToken]
        const balance = balances.find(
          (balance) => balance.token.denom === form.token.denom
        )

        if (!balance) {
          return ZERO_IN_BASE
        }

        return new BigNumberInWei(balance.balance || 0).toBase(
          balance.token.decimals
        )
      }

      const balance = subaccountBalancesWithToken.find(
        (balance) => balance.denom === form.token.denom
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.availableBalance || 0).toBase(
        balance.token.decimals
      )
    },

    onDepositBalance(): BigNumberInBase {
      const { bridgeType, form, erc20TokensWithBalanceAndPriceFromBank } = this

      if (bridgeType !== BridgeType.Deposit) {
        return ZERO_IN_BASE
      }

      const tokenWithBalance = erc20TokensWithBalanceAndPriceFromBank.find(
        (token) => token.denom === form.token.denom
      )

      if (!tokenWithBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(tokenWithBalance.balance).toBase(
        tokenWithBalance.decimals
      )
    },

    onWithdrawBalance(): BigNumberInBase {
      const {
        bridgeType,
        form,
        bankBalancesWithToken,
        ibcBankBalancesWithToken
      } = this

      if (bridgeType !== BridgeType.Withdraw) {
        return ZERO_IN_BASE
      }

      const balances = [...bankBalancesWithToken, ...ibcBankBalancesWithToken]
      const balance = balances.find(
        (balance) => balance.token.denom === form.token.denom
      )

      if (!balance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInWei(balance.balance || 0).toBase(
        balance.token.decimals
      )
    },

    balance(): BigNumberInBase {
      const {
        bridgeType,
        onTransferBalance,
        onDepositBalance,
        onWithdrawBalance
      } = this

      if (bridgeType === BridgeType.Transfer) {
        return onTransferBalance
      }

      if (bridgeType === BridgeType.Deposit) {
        return onDepositBalance
      }

      // Withdraw
      return onWithdrawBalance
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
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.Bridge]
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  mounted() {
    this.$root.$on('bridge:transfer', this.handleTransfer)
    this.$root.$on('bridge:deposit', this.handleDeposit)
    this.$root.$on('bridge:withdraw', this.handleWithdraw)
  },

  beforeDestroy() {
    this.$root.$off('bridge:transfer', this.handleTransfer)
    this.$root.$off('bridge:deposit', this.handleDeposit)
    this.$root.$off('bridge:withdraw', this.handleWithdraw)
  },

  methods: {
    handleTransferNowClick() {
      //
    },

    handleAmountChange(amount: string) {
      this.$emit('input-amount:update', amount)
    },

    handleTokenChange(token: Token) {
      this.$emit('input-token:update', token)
    },

    handleTransfer(token: Token) {
      this.$emit('input-token:update', token || injToken)
      this.$emit('bridge-type:update', BridgeType.Transfer)
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleDeposit(token: Token) {
      this.$emit('input-token:update', token || injToken)
      this.$emit('bridge-type:update', BridgeType.Deposit)
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleWithdraw(token: Token) {
      this.$emit('input-token:update', token || injToken)
      this.$emit('bridge-type:update', BridgeType.Withdraw)
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleCloseModal() {
      this.$accessor.modal.closeModal(Modal.Bridge)
    },

    handleTransferDirectionSwitch() {
      this.$emit(
        'transfer-direction:update',
        this.transferDirection === TransferDirection.bankToTradingAccount
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
      )
    },

    handleBridgingNetworkSwitch(bridgingNetwork: BridgingNetwork) {
      this.$emit('bridging-network:update', bridgingNetwork)
    }
  }
})
</script>
