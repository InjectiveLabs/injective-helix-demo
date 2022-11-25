<template>
  <VModal
    :is-open="isModalOpen"
    sm
    :modal-closed:animation="handleResetBridge"
    @modal-closed="handleCloseModal"
  >
    <div slot="title">
      <h3 class="flex items-center">
        {{ bridgeTitle }}
        <IconInfoTooltip
          v-if="bridgeType === BridgeType.Transfer"
          class="ml-2"
          :tooltip="$t('bridge.transferTitleTooltip')"
        />
      </h3>
    </div>
    <ValidationObserver
      v-if="isUserWalletConnected"
      v-slot="{ invalid }"
      ref="form"
    >
      <div class="mb-4">
        <TransferDirectionSwitch
          v-if="bridgeType === BridgeType.Transfer"
          v-bind="{ transferDirection }"
          @transfer-direction:switch="handleTransferDirectionSwitch"
        />
        <NetworkSelect
          v-else
          v-bind="{ value: bridgingNetwork, bridgeType }"
          @bridging-network:change="handleBridgingNetworkSwitch"
        >
          <template slot="title">{{ networkSelectorTitle }}</template>
        </NetworkSelect>
      </div>
      <div v-if="isWithdrawToInjectiveAddress" class="mt-6">
        <ValidationProvider
          v-slot="{ errors, valid }"
          name="form.destination"
          :rules="`required|injaddress`"
        >
          <VInput
            :value="form.destinationAddress"
            :errors="errors"
            :valid="valid"
            placeholder="inj"
            :label="$t('bridge.injAddress')"
            data-cy="transfer-modal-inj-address-input"
            @input="handleDestinationAddressChange"
          >
          </VInput>
        </ValidationProvider>
      </div>
      <div v-if="isWithdrawToInjectiveAddress" class="my-4 w-full">
        <div class="flex items-center justify-between text-gray-200">
          <span v-tooltip="{ content: $t('memo.memoTooltip') }" class="text-xs">
            {{ $t('memo.memo') }}
          </span>
          <VCheckbox v-model="memoRequired" @input="handleMemoChange('')">
            {{ $t('common.required') }}
          </VCheckbox>
        </div>
        <div v-if="memoRequired" class="mt-2">
          <VInput
            :value="form.memo"
            :placeholder="$t('memo.memoPlaceholder')"
            @input="handleMemoChange"
          >
          </VInput>
        </div>
      </div>
      <div v-if="!isIbcTransfer">
        <div v-if="hasAllowance">
          <TokenSelector
            :form-id="formId"
            :amount="form.amount"
            :value="form.token"
            :max-decimals="maxDecimals"
            :origin="origin"
            :destination="destination"
            :is-ibc-transfer="isIbcTransfer"
            :balance="transferableBalance"
            :balance-decimal-places="balanceDecimalPlaces"
            :balance-label="$t('bridge.available')"
            :options="supplyWithSortedBalanceInBase"
            small
            show-input
            show-custom-indicator
            show-balance
            show-errors-below
            @input:amount="handleAmountChange"
            @input:token="handleTokenChange"
            @input:max="handleMax"
          />
        </div>
        <div class="mt-6 text-center">
          <VButton
            v-if="shouldConnectMetamask"
            lg
            primary
            class="w-full font-semibold rounded"
            data-cy="transfer-modal-transfer-now-button"
            :disabled="true"
            @click="() => {}"
          >
            {{ $t('bridge.keplrConnectedForEthereum') }}
          </VButton>
          <template v-else>
            <v-allowance
              v-if="!hasAllowance"
              :token-with-balance="form.token"
            />

            <VButton
              v-else
              lg
              primary
              class="w-full font-semibold rounded"
              data-cy="transfer-modal-transfer-now-button"
              :disabled="invalid"
              @click="handleTransferNowClick"
            >
              {{ $t('bridge.transferNow') }}
            </VButton>
          </template>
        </div>
      </div>
      <IbcTransferNote v-else />
    </ValidationObserver>
    <UserWalletConnectWarning v-else />
  </VModal>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import {
  BankBalanceWithToken,
  BankBalanceWithTokenAndBalance,
  BridgingNetwork,
  getTokenLogoWithVendorPathPrefix,
  SubaccountBalanceWithToken,
  TokenWithBalanceAndPrice,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { isCosmosWallet, Wallet } from '@injectivelabs/wallet-ts'
import { Token } from '@injectivelabs/token-metadata'
import { INJ_DENOM } from '@injectivelabs/sdk-ts'
import { BridgeType, Modal, TransferDirection } from '~/types'
import TokenSelector from '~/components/partials/portfolio/bridge/token-selector/index.vue'
import VAllowance from '~/components/elements/allowance.vue'
import NetworkSelect from '~/components/partials/portfolio/bridge/network-select.vue'
import IbcTransferNote from '~/components/partials/portfolio/bridge/ibc-transfer-note.vue'
import TransferDirectionSwitch from '~/components/partials/portfolio/bridge/transfer-direction-switch.vue'
import {
  INJ_GAS_BUFFER,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'

export default Vue.extend({
  components: {
    ValidationObserver,
    TokenSelector,
    NetworkSelect,
    IbcTransferNote,
    TransferDirectionSwitch,
    ValidationProvider,
    VAllowance
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
      formId: 0,
      memoRequired: false,
      BridgeType,
      TransferDirection,
      BridgingNetwork
    }
  },

  computed: {
    maxDecimals(): number {
      const { form } = this

      const defaultDecimalsLessThanTokenDecimals =
        UI_DEFAULT_DISPLAY_DECIMALS < form.token.decimals

      if (defaultDecimalsLessThanTokenDecimals) {
        return UI_DEFAULT_DISPLAY_DECIMALS
      }

      return form.token.decimals
    },

    isUserWalletConnected(): boolean {
      return this.$accessor.wallet.isUserWalletConnected
    },

    wallet(): Wallet {
      return this.$accessor.wallet.wallet
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

    isModalOpen(): boolean {
      return this.$accessor.modal.modals[Modal.Bridge]
    },

    modalData(): any {
      return this.$accessor.modal.data
    },

    isWithdrawToInjectiveAddress(): boolean {
      const { bridgeType, destination } = this

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

    networkSelectorTitle(): string {
      const { bridgeType } = this

      if (bridgeType === BridgeType.Deposit) {
        return this.$t('bridge.selectOriginNetwork')
      }

      // Withdraw
      return this.$t('bridge.selectDestinationNetwork')
    },

    hasAllowance(): boolean {
      const { bridgeType, erc20TokensWithBalanceAndPriceFromBank, form } = this

      if ([BridgeType.Transfer, BridgeType.Withdraw].includes(bridgeType)) {
        return true
      }

      const token = erc20TokensWithBalanceAndPriceFromBank.find(
        ({ denom }) => denom === form.token.denom
      )

      if (!token) {
        return false
      }

      return new BigNumberInBase(token.allowance).gt(0)
    },

    isWalletExemptFromGasFee(): boolean {
      const { wallet } = this

      return !isCosmosWallet(wallet)
    },

    shouldConnectMetamask(): boolean {
      const { wallet, bridgeType } = this

      return isCosmosWallet(wallet) && bridgeType === BridgeType.Deposit
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

      return onWithdrawBalance
    },

    transferableBalance(): BigNumberInBase {
      const { isWalletExemptFromGasFee, transferDirection, form, balance } =
        this

      if (
        isWalletExemptFromGasFee ||
        transferDirection === TransferDirection.tradingAccountToBank ||
        form.token.denom !== INJ_DENOM
      ) {
        return balance
      }

      const transferableBalance = balance.minus(INJ_GAS_BUFFER)

      if (transferableBalance.lte(ZERO_IN_BASE)) {
        return ZERO_IN_BASE
      }

      return transferableBalance
    },

    balanceDecimalPlaces(): number {
      return UI_DEFAULT_DISPLAY_DECIMALS
    },

    erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken(): BankBalanceWithToken[] {
      const { erc20TokensWithBalanceAndPriceFromBank } = this

      return erc20TokensWithBalanceAndPriceFromBank
        .map((token) => ({
          token,
          denom: token.denom,
          balance: token.balance
        }))
        .filter(({ denom }) => !denom.startsWith('ibc'))
    },

    subaccountBalancesWithTokenAsBankBalanceWithToken(): BankBalanceWithToken[] {
      const { subaccountBalancesWithToken } = this

      return subaccountBalancesWithToken.map((balance) => ({
        ...balance,
        balance: balance.availableBalance
      }))
    },

    supply(): BankBalanceWithToken[] {
      const {
        bankBalancesWithToken,
        subaccountBalancesWithTokenAsBankBalanceWithToken,
        erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken,
        origin,
        destination,
        isIbcTransfer
      } = this

      if (isIbcTransfer) {
        return [] // IBC transfers are not supported on the Bridge Lite
      }

      if (
        origin === BridgingNetwork.Ethereum &&
        destination === BridgingNetwork.Injective
      ) {
        return erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken
      }

      if (
        origin === BridgingNetwork.Injective &&
        destination === BridgingNetwork.Ethereum
      ) {
        return erc20TokensWithBalanceAndPriceFromBankAsBankBalanceWithToken
      }

      if (origin === TransferDirection.bankToTradingAccount) {
        return bankBalancesWithToken
      }

      if (origin === TransferDirection.tradingAccountToBank) {
        return subaccountBalancesWithTokenAsBankBalanceWithToken
      }

      return bankBalancesWithToken
    },

    supplyWithSortedBalanceInBase(): BankBalanceWithTokenAndBalance[] {
      const { supply } = this

      const result = supply
        .map((token) => {
          const balance = new BigNumberInWei(token.balance || 0).toBase(
            token.token ? token.token.decimals : 18
          )

          return {
            ...token,
            token: {
              ...token.token,
              logo: getTokenLogoWithVendorPathPrefix(token.token.logo)
            },
            balance: balance.toFixed()
          } as BankBalanceWithTokenAndBalance
        })
        .sort((supply1, supply2) =>
          new BigNumberInBase(supply2.balance).minus(supply1.balance).toNumber()
        )

      return result
    },

    $form(): InstanceType<typeof ValidationObserver> {
      return this.$refs.form as InstanceType<typeof ValidationObserver>
    }
  },

  watch: {
    modalData: {
      handler(value) {
        if (!value) {
          return
        }

        const { supplyWithSortedBalanceInBase } = this

        if (
          !supplyWithSortedBalanceInBase ||
          supplyWithSortedBalanceInBase.length === 0
        ) {
          return
        }

        const destinationToken = supplyWithSortedBalanceInBase.find(
          (token) => token.denom === value.denom
        )

        if (!destinationToken) {
          return
        }

        this.$emit('input-token:update', destinationToken.token)
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    handleTransferNowClick() {
      this.$emit('bridge:confirm')
    },

    handleAmountChange(amount: string) {
      this.$emit('input-amount:update', amount)
    },

    handleMemoChange(memo: string) {
      this.$emit('input-memo:update', memo || '')
    },

    handleTokenChange(token: Token) {
      this.$emit('input-token:update', token)
      this.resetForm()
    },

    handleMax(value: string) {
      this.$emit('input-amount:update', value)
    },

    handleDestinationAddressChange(address: string) {
      this.$emit('input-destinationAddress:update', address)
    },

    handleCloseModal() {
      this.$accessor.modal.closeModal(Modal.Bridge)
      this.formId += 1
    },

    handleResetBridge() {
      this.$emit('bridge:reset')
    },

    handleTransferDirectionSwitch() {
      this.$emit(
        'transfer-direction:update',
        this.transferDirection === TransferDirection.bankToTradingAccount
          ? TransferDirection.tradingAccountToBank
          : TransferDirection.bankToTradingAccount
      )
      this.resetForm()
    },

    handleBridgingNetworkSwitch(bridgingNetwork: BridgingNetwork) {
      this.$emit('bridging-network:update', bridgingNetwork)
    },

    resetForm() {
      const { $form } = this

      if ($form) {
        $form.reset()
      }
    }
  }
})
</script>
