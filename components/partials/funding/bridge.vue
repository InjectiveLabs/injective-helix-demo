<template>
  <v-modal :is-open="isModalOpen" md @modal-closed="handleCloseModal">
    <div slot="title">
      <h3>{{ bridgeTitle }}</h3>
    </div>
    <ValidationObserver v-slot="{ invalid }" ref="form">
      <div>
        <VDirectionSwitch
          v-if="bridgeType === BridgeType.Transfer"
          v-bind="{
            direction
          }"
          @transfer-direction:switch="handleDirectionSwitch"
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
import VTokenSelector from '~/components/partials/bridge/token-selector/index.vue'
import VBalance from '~/components/partials/bridge/balance.vue'
import VDirectionSwitch from '~/components/partials/bridge/direction-switch.vue'

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
      direction: TransferDirection.bankToTradingAccount,
      TransferDirection,
      BridgeType,

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

      return ''
    },

    bridgeNote(): string {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.$t('bridge.selectTokenAndAmount')
      }

      return ''
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
        direction,
        subaccountBalancesWithToken,
        bankBalancesWithToken,
        ibcBankBalancesWithToken
      } = this

      if (bridgeType !== BridgeType.Transfer) {
        return ZERO_IN_BASE
      }

      if (direction === TransferDirection.bankToTradingAccount) {
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

    balance(): BigNumberInBase {
      const { bridgeType, onTransferBalance } = this

      if (bridgeType === BridgeType.Transfer) {
        return onTransferBalance
      }

      return ZERO_IN_BASE
    },

    origin(): BridgingNetwork | TransferDirection {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.direction
      }

      return BridgingNetwork.Ethereum
    },

    destination(): BridgingNetwork | TransferDirection {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return this.direction === TransferDirection.bankToTradingAccount
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
      }

      return BridgingNetwork.Ethereum
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.Bridge]
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  mounted() {
    this.$root.$on('bridge:transfer', this.handleTransferModal)
  },

  beforeDestroy() {
    this.$root.$off('bridge:transfer', this.handleTransferModal)
  },

  methods: {
    handleTransferNowClick() {
      //
    },

    handleAmountChange(amount: string) {
      this.form.amount = amount
    },

    handleTransferModal(token: Token) {
      this.form.token = token
      this.bridgeType = BridgeType.Transfer
      this.$accessor.modal.openModal(Modal.Bridge)
    },

    handleCloseModal() {
      this.$accessor.modal.closeModal(Modal.Bridge)
    },

    handleDirectionSwitch() {
      this.direction =
        this.direction === TransferDirection.bankToTradingAccount
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
    }
  }
})
</script>
