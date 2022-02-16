<template>
  <v-modal :is-open="isModalOpen" md @modal-closed="handleCloseModal">
    <div slot="title">
      <h3>{{ bridgeTitle }}</h3>
    </div>
    <ValidationObserver v-slot="{ invalid }" ref="form">
      <div>
        <VDirectionSwitch
          v-if="bridgeType === BridgeType.Transfer"
          v-bind="{ transferDirection }"
          @transfer-direction:switch="handleTransferDirectionSwitch"
        />
      </div>
      <div v-if="isUserWalletConnected">
        <h3 class="text-xl font-semibold mt-6">
          {{ bridgeNote }}
        </h3>

        <VTokenSelector
          v-model="form.token"
          class="mt-6"
          :amount="form.amount"
          :origin="origin"
          :destination="destination"
          :balance="balance"
          @input:amount="handleAmountChange"
        >
        </VTokenSelector>

        <VBalance :balance="balance" :token="form.token" />

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
      </div>
      <v-user-wallet-connect-warning v-else />
    </ValidationObserver>
  </v-modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { ValidationObserver } from 'vee-validate'
import {
  BankBalanceWithToken,
  BridgingNetwork,
  SubaccountBalanceWithToken,
  Token,
  ZERO_IN_BASE
} from '@injectivelabs/ui-common'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { injToken } from '~/app/data/token'
import { BridgeType, Modal, TransferDirection } from '~/types'
import VTokenSelector from '~/components/partials/funding/bridge/token-selector/index.vue'
import VBalance from '~/components/partials/funding/bridge/balance.vue'
import VDirectionSwitch from '~/components/partials/funding/bridge/direction-switch.vue'

export default Vue.extend({
  components: {
    ValidationObserver,
    VTokenSelector,
    VDirectionSwitch,
    VBalance
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

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
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
        return this.$t('bridge.selectTokenAndAmount')
      }

      if (bridgeType === BridgeType.Deposit) {
        return this.$t('bridge.selectTokenAndAmount')
      }

      // Withdraw
      return this.$t('bridge.selectTokenAndAmount')
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
      const { bridgeType } = this

      if (bridgeType !== BridgeType.Deposit) {
        return ZERO_IN_BASE
      }

      // TODO
      return ZERO_IN_BASE
    },

    onWithdrawBalance(): BigNumberInBase {
      const { bridgeType } = this

      if (bridgeType !== BridgeType.Withdraw) {
        return ZERO_IN_BASE
      }

      // TODO
      return ZERO_IN_BASE
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
      this.form.amount = amount
    },

    handleTransfer(token: Token) {
      this.form.token = token || injToken
      this.bridgeType = BridgeType.Transfer
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleDeposit(token: Token) {
      this.form.token = token || injToken
      this.bridgeType = BridgeType.Deposit
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleWithdraw(token: Token) {
      this.form.token = token || injToken
      this.bridgeType = BridgeType.Withdraw
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleCloseModal() {
      this.$accessor.modal.closeModal(Modal.Bridge)
    },

    handleTransferDirectionSwitch() {
      this.transferDirection =
        this.transferDirection === TransferDirection.bankToTradingAccount
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
    }
  }
})
</script>
