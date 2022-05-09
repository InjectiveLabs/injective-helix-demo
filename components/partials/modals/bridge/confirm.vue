<template>
  <v-modal :is-open="isModalOpen" sm @modal-closed="handleModalClose">
    <div slot="title">
      <h3>{{ bridgeTitle }}</h3>
    </div>

    <div>
      <div v-if="isUserWalletConnected">
        <div v-if="!isIbcTransfer">
          <h3 class="text-xl font-semibold mt-6">
            {{ $t('bridge.confirmTransaction') }}
          </h3>

          <div v-if="form.token" class="text-center mt-6 mb-10">
            <img
              v-if="form.token.logo"
              :src="form.token.logo"
              :alt="form.token.name"
              class="rounded-full w-10 h-10 mx-auto"
            />
            <v-icon-category-alt
              v-else
              class="text-gray-200 rounded-full w-10 h-10 mx-auto"
            />
            <p class="text-gray-200 text-2xl font-bold tracking-0.4 mt-4">
              {{ amountToString }} {{ form.token.symbol }}
            </p>
            <p
              v-if="amountInUsd.gt(0)"
              class="text-gray-500 text-sm tracking-0.4 mt-2"
            >
              ${{ amountInUsdToString }}
            </p>
          </div>

          <div
            v-if="originNetworkMeta && destinationNetworkMeta"
            class="flex justify-between items-center mt-6"
          >
            <v-network-card-base
              class="w-1/2"
              :hide-icon="
                originNetworkMeta.value === destinationNetworkMeta.value
              "
              :network-meta="originNetworkMeta"
            />

            <div
              class="bg-primary-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full"
            >
              <v-icon-arrow class="text-gray-1000 w-4 h-4 rotate-180" />
            </div>

            <v-network-card-base
              class="w-1/2"
              :hide-icon="
                originNetworkMeta.value === destinationNetworkMeta.value
              "
              :network-meta="destinationNetworkMeta"
            />
          </div>

          <div v-if="origin === BridgingNetwork.Injective" class="mt-6">
            <!-- Amount -->
            <v-confirm-amount-row class="mb-2">
              <template slot="title">
                {{ $t('bridge.amount') }}
              </template>

              <template slot="amount">
                {{ amountToString }} {{ form.token.symbol }}
              </template>

              <template slot="amountInUsd">
                ${{ amountInUsdToString }}
              </template>
            </v-confirm-amount-row>

            <!-- Bridge Fee -->
            <v-confirm-amount-row
              v-if="destination === BridgingNetwork.Ethereum"
              class="mb-2"
            >
              <template slot="title">
                {{ $t('bridge.bridgeFee') }}
              </template>

              <template slot="amount">
                <span>
                  {{ ethBridgeFeeToString }}
                  {{ form.token.symbol }}
                </span>
              </template>

              <template slot="amountInUsd">
                ${{ ethBridgeFeeInUsdToString }}
              </template>
            </v-confirm-amount-row>
          </div>

          <div class="border-t border-gray-700 mt-4 pt-4" />

          <div v-if="origin === BridgingNetwork.Injective">
            <v-confirm-amount-row class="mb-2" bold>
              <template slot="title">
                {{ $t('bridge.transferAmount') }}
              </template>

              <template slot="amount">
                {{ transferAmountToString }} {{ form.token.symbol }}
              </template>

              <template slot="amountInUsd">
                ${{ transferAmountInUsdToString }}
              </template>
            </v-confirm-amount-row>

            <v-confirm-amount-row bold class="mb-10">
              <template slot="title">
                {{ $t('bridge.gasFee') }}
              </template>

              <template slot="amount">
                {{ gasFeeToString }} {{ injToken.symbol }}
              </template>

              <template slot="amountInUsd">
                ${{ gasFeeInUsdToString }}
              </template>
            </v-confirm-amount-row>
          </div>

          <div class="text-center mt-6">
            <v-button
              lg
              primary
              class="w-full xs:w-2/3 font-bold"
              :disabled="buttonConfirmationDisabled"
              :status="status"
              @click="handlerFunction"
            >
              {{ buttonConfirmationText }}
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
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import {
  BRIDGE_FEE_IN_USD,
  INJ_DENOM,
  BridgingNetwork,
  NetworkMeta,
  Token,
  ZERO_IN_BASE,
  TokenWithUsdPrice,
  BankBalances,
  TokenWithBalanceAndPrice
} from '@injectivelabs/ui-common'
import { Modal, TransferDirection, BridgeType } from '~/types/enums'
import VNetworkCardBase from '~/components/partials/portfolio/bridge/network-card/index.vue'
import VIbcTransferNote from '~/components/partials/portfolio/bridge/ibc-transfer-note.vue'
import VConfirmAmountRow from '~/components/partials/portfolio/bridge/confirm-amount-row.vue'
import { networksMeta, transferSideMeta } from '~/app/data/bridge'
import { TransferSide } from '~/types'
import { injToken } from '~/app/data/token'
import {
  INJ_TO_IBC_TRANSFER_FEE,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    VIbcTransferNote,
    VNetworkCardBase,
    VConfirmAmountRow
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

    origin: {
      required: true,
      type: String as PropType<BridgingNetwork | TransferDirection>
    },

    destination: {
      required: true,
      type: String as PropType<BridgingNetwork | TransferDirection>
    },

    isIbcTransfer: {
      required: true,
      type: Boolean
    },

    form: {
      required: true,
      type: Object as PropType<{
        token: Token
        memo: string
        destinationAddress: string
        amount: string
      }>
    }
  },

  data() {
    return {
      BridgingNetwork,
      TransferDirection,
      status: new Status()
    }
  },

  computed: {
    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    injectiveAddress(): string {
      return this.$accessor.wallet.injectiveAddress
    },

    injUsdPrice(): number {
      return this.$accessor.token.injUsdPrice
    },

    bankBalances(): BankBalances {
      return this.$accessor.bank.balances
    },

    erc20TokensWithBalanceAndPriceFromBank(): TokenWithBalanceAndPrice[] {
      return this.$accessor.token.erc20TokensWithBalanceAndPriceFromBank
    },

    injToken(): TokenWithUsdPrice {
      const { injUsdPrice } = this

      return {
        ...injToken,
        usdPrice: injUsdPrice
      }
    },

    tokenWithBalanceAndPrice(): TokenWithBalanceAndPrice | undefined {
      const { erc20TokensWithBalanceAndPriceFromBank, form } = this

      return erc20TokensWithBalanceAndPriceFromBank.find(
        (token) => token.denom === form.token.denom
      )
    },

    injBalance(): BigNumberInBase {
      const { injToken, bankBalances } = this

      const injBalance = bankBalances[injToken.denom || INJ_DENOM]

      if (!injBalance) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(injBalance)
    },

    hasSufficientBalance(): boolean {
      const { injBalance } = this

      return injBalance.gt(new BigNumberInBase(INJ_TO_IBC_TRANSFER_FEE))
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

    originNetworkMeta(): NetworkMeta | undefined {
      const { transferDirection, bridgingNetwork, bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return transferDirection === TransferDirection.bankToTradingAccount
          ? transferSideMeta[TransferSide.Bank]
          : transferSideMeta[TransferSide.TradingAccount]
      }

      if (bridgeType === BridgeType.Deposit) {
        return networksMeta.find((meta) => meta.value === bridgingNetwork)
      }

      // Withdraw
      return networksMeta.find(
        (meta) => meta.value === BridgingNetwork.Injective
      )
    },

    destinationNetworkMeta(): NetworkMeta | undefined {
      const { transferDirection, bridgingNetwork, bridgeType } = this

      if (bridgeType === BridgeType.Transfer) {
        return transferDirection === TransferDirection.bankToTradingAccount
          ? transferSideMeta[TransferSide.TradingAccount]
          : transferSideMeta[TransferSide.Bank]
      }

      if (bridgeType === BridgeType.Deposit) {
        return networksMeta.find(
          (meta) => meta.value === BridgingNetwork.Injective
        )
      }

      // Withdraw
      return networksMeta.find((meta) => meta.value === bridgingNetwork)
    },

    destinationIsEthereumNetwork(): boolean {
      const { destination } = this

      return BridgingNetwork.Ethereum === destination
    },

    originIsInjectiveNetwork(): boolean {
      const { origin } = this

      return BridgingNetwork.Injective === origin
    },

    originOrDestinationAreTransferDirection(): boolean {
      const { bridgeType } = this

      return bridgeType === BridgeType.Transfer
    },

    usdPrice(): BigNumberInBase {
      const { tokenWithBalanceAndPrice } = this

      if (tokenWithBalanceAndPrice && tokenWithBalanceAndPrice.usdPrice) {
        return new BigNumberInBase(tokenWithBalanceAndPrice.usdPrice || 0)
      }

      return ZERO_IN_BASE
    },

    amount(): BigNumberInBase {
      const { form } = this

      return new BigNumberInBase(form.amount || 0)
    },

    amountToString(): string {
      const { amount } = this

      return amount.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    amountInUsd(): BigNumberInBase {
      const { amount, usdPrice } = this

      return amount.multipliedBy(new BigNumberInBase(usdPrice))
    },

    amountInUsdToString(): string {
      const { amountInUsd } = this

      return amountInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    ethBridgeFee(): BigNumberInBase {
      const { tokenWithBalanceAndPrice } = this

      if (!tokenWithBalanceAndPrice) {
        return ZERO_IN_BASE
      }

      if (!tokenWithBalanceAndPrice.usdPrice) {
        return ZERO_IN_BASE
      }

      return new BigNumberInBase(BRIDGE_FEE_IN_USD).dividedBy(
        tokenWithBalanceAndPrice.usdPrice
      )
    },

    ethBridgeFeeToString(): string {
      const { ethBridgeFee } = this

      return ethBridgeFee.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    ethBridgeFeeInUsd(): BigNumberInBase {
      const { ethBridgeFee, usdPrice } = this

      return ethBridgeFee.multipliedBy(new BigNumberInBase(usdPrice))
    },

    ethBridgeFeeInUsdToString(): string {
      const { ethBridgeFeeInUsd } = this

      return ethBridgeFeeInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    gasFee(): BigNumberInBase {
      return new BigNumberInBase(INJ_TO_IBC_TRANSFER_FEE)
    },

    gasFeeToString(): string {
      const { gasFee } = this

      return gasFee.toFormat()
    },

    gasFeeInUsd(): BigNumberInBase {
      const { gasFee, injToken } = this

      return gasFee.multipliedBy(new BigNumberInBase(injToken.usdPrice))
    },

    gasFeeInUsdToString(): string {
      const { gasFeeInUsd } = this

      return gasFeeInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    transferAmount(): BigNumberInBase {
      const { destination, amount, ethBridgeFee } = this

      if (destination === BridgingNetwork.Ethereum) {
        return amount.minus(ethBridgeFee)
      }

      return amount
    },

    transferAmountToString(): string {
      const { transferAmount } = this

      return transferAmount.toFormat(UI_DEFAULT_DISPLAY_DECIMALS)
    },

    transferAmountInUsd(): BigNumberInBase {
      const { transferAmount, usdPrice } = this

      return transferAmount.multipliedBy(new BigNumberInBase(usdPrice))
    },

    transferAmountInUsdToString(): string {
      const { transferAmountInUsd } = this

      return transferAmountInUsd.toFormat(UI_DEFAULT_MIN_DISPLAY_DECIMALS)
    },

    amountLargerThanBridgeFee(): boolean {
      const {
        ethBridgeFeeInUsd,
        amountInUsd,
        destinationIsEthereumNetwork
      } = this

      if (!destinationIsEthereumNetwork) {
        return true
      }

      return amountInUsd.gt(ethBridgeFeeInUsd)
    },

    buttonConfirmationText(): string {
      const {
        hasSufficientBalance,
        originIsInjectiveNetwork,
        amountLargerThanBridgeFee
      } = this

      if (originIsInjectiveNetwork && !hasSufficientBalance) {
        return this.$t('bridge.insufficientINJForGas')
      }

      if (!amountLargerThanBridgeFee) {
        return this.$t('bridge.insufficientAmount')
      }

      return this.$t('bridge.confirm')
    },

    buttonConfirmationDisabled(): boolean {
      const {
        originIsInjectiveNetwork,
        hasSufficientBalance,
        amountLargerThanBridgeFee
      } = this

      if (!amountLargerThanBridgeFee) {
        return true
      }

      return originIsInjectiveNetwork && !hasSufficientBalance
    },

    handlerFunction(): Function {
      const { bridgeType, transferDirection, destination } = this

      if (bridgeType === BridgeType.Transfer) {
        return transferDirection === TransferDirection.bankToTradingAccount
          ? this.handleTransferToTradingAccount
          : this.handleTransferToBank
      }

      if (bridgeType === BridgeType.Deposit) {
        return this.handleDeposit
      }

      if (
        bridgeType === BridgeType.Withdraw &&
        destination === BridgingNetwork.Injective
      ) {
        return this.handleWithdrawToInjective
      }

      // Withdraw to Ethereum
      return this.handleWithdraw
    },

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.BridgeConfirm]
    }
  },

  methods: {
    handleModalClose() {
      this.$emit('bridge:reset')
      this.$accessor.modal.closeModal(Modal.BridgeConfirm)
    },

    handleConfirmClick() {
      this.$emit('bridge:confirmed')
    },

    handleWithdrawToInjective() {
      const { form } = this

      this.status.setLoading()

      this.$accessor.bank
        .transfer({
          destination: form.destinationAddress,
          amount: new BigNumberInBase(form.amount),
          denom: form.token.denom,
          memo: form.memo,
          token: form.token
        })
        .then(() => {
          this.$toast.success(
            this.$t('bridge.withdrawToInjectiveAddressSuccess')
          )
          this.$emit('bridge:confirmed')
          this.$root.$emit('bridge:reset')
          this.$root.$emit('funding:refresh')
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleTransferToTradingAccount() {
      const { form } = this

      this.status.setLoading()

      this.$accessor.account
        .deposit({
          amount: new BigNumberInBase(form.amount),
          token: form.token
        })
        .then(() => {
          this.$toast.success(this.$t('bridge.depositToTradingAccountSuccess'))
          this.$emit('bridge:confirmed')
          this.$root.$emit('bridge:reset')
          this.$root.$emit('funding:refresh')
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleWithdraw() {
      const { form, ethBridgeFee } = this

      this.status.setLoading()

      if (ethBridgeFee.gte(form.amount)) {
        return
      }

      this.$accessor.token
        .withdraw({
          bridgeFee: ethBridgeFee,
          token: form.token,
          amount: new BigNumberInBase(form.amount)
        })
        .then(() => {
          this.$toast.success(this.$t('bridge.withdrawFromInjectiveSuccess'))
          this.$emit('bridge:confirmed')
          this.$root.$emit('bridge:reset')
          this.$root.$emit('funding:refresh')
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleDeposit() {
      const { form } = this

      this.status.setLoading()

      this.$accessor.token
        .transfer({
          amount: new BigNumberInBase(form.amount),
          token: form.token
        })
        .then(() => {
          this.$toast.success(this.$t('bridge.depositToInjectiveSuccess'))
          this.$emit('bridge:confirmed')
          this.$root.$emit('bridge:reset')
          this.$root.$emit('funding:refresh')
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    },

    handleTransferToBank() {
      const { form } = this

      this.status.setLoading()

      this.$accessor.account
        .withdraw({
          amount: new BigNumberInBase(form.amount),
          token: form.token
        })
        .then(() => {
          this.$toast.success(
            this.$t('bridge.withdrawFromTradingAccountSuccess')
          )
          this.$emit('bridge:confirmed')
          this.$root.$emit('bridge:reset')
          this.$root.$emit('funding:refresh')
        })
        .catch(this.$onRejected)
        .finally(() => {
          this.status.setIdle()
        })
    }
  }
})
</script>
