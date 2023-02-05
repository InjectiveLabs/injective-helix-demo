<script setup lang="ts">
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import {
  BRIDGE_FEE_IN_USD,
  ZERO_IN_BASE,
  TokenWithUsdPrice,
  TokenWithBalanceAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { useI18n } from 'vue-i18n'
import { Modal, BridgeType, BridgeField } from '@/types/enums'
import { BusEvents } from '@/types'
import { injToken } from '@/app/data/token'
import {
  INJ_GAS_FEE,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'

const walletStore = useWalletStore()
const tokenStore = useTokenStore()
const accountStore = useAccountStore()
const bankStore = useBankStore()
const modalStore = useModalStore()
const { t } = useI18n()
const { success } = useNotifications()
const { $onError } = useNuxtApp()

const emit = defineEmits<{
  (e: 'form:submit'): void
}>()

const {
  form,
  resetForm,
  bridgeType,
  originNetworkMeta,
  destinationNetworkMeta,
  destinationIsEthereum,
  destinationIsInjective,
  isBankToTradingAccount,
  networkIsNotSupported,
  originIsInjective
} = useBridgeState()

const { emit: emitFundingRefresh } = useEventBus<void>(BusEvents.FundingRefresh)

const gasFee = new BigNumberInBase(INJ_GAS_FEE)
const gasFeeToString = gasFee.toFormat()

const status = reactive(new Status())

const isModalOpen = computed(() => modalStore.modals[Modal.BridgeConfirm])

const injTokenWithPrice = computed<TokenWithUsdPrice>(() => ({
  ...injToken,
  usdPrice: tokenStore.injUsdPrice
}))

const tokenWithBalanceAndPrice = computed(() => {
  return tokenStore.erc20TokensWithBalanceAndPriceFromBank.find(
    (token) => token.denom === form[BridgeField.Token].denom
  ) as TokenWithBalanceAndPrice | undefined
})

const usdPrice = computed(
  () => new BigNumberInBase(tokenWithBalanceAndPrice.value?.usdPrice || 0)
)

const amount = computed(
  () => new BigNumberInBase(form[BridgeField.Amount] || 0)
)

const { valueToString: amountToString } = useBigNumberFormatter(amount, {
  decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
})

const amountInUsd = computed(() =>
  amount.value.multipliedBy(new BigNumberInBase(usdPrice.value))
)

const { valueToString: amountInUsdToString } = useBigNumberFormatter(
  amountInUsd,
  {
    decimalPlaces: UI_DEFAULT_MIN_DISPLAY_DECIMALS
  }
)

const ethBridgeFee = computed(() => {
  if (!tokenWithBalanceAndPrice.value) {
    return ZERO_IN_BASE
  }

  if (!tokenWithBalanceAndPrice.value.usdPrice) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(BRIDGE_FEE_IN_USD).dividedBy(
    tokenWithBalanceAndPrice.value.usdPrice
  )
})

const { valueToString: ethBridgeFeeToString } = useBigNumberFormatter(
  ethBridgeFee,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const ethBridgeFeeInUsd = computed(() =>
  ethBridgeFee.value.multipliedBy(new BigNumberInBase(usdPrice.value))
)

const { valueToString: ethBridgeFeeInUsdToString } =
  useBigNumberFormatter(ethBridgeFeeInUsd)

const transferAmount = computed(() => {
  if (destinationIsEthereum.value) {
    return amount.value.minus(ethBridgeFee.value)
  }

  return amount.value
})

const { valueToString: transferAmountToString } = useBigNumberFormatter(
  transferAmount,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const amountLargerThanEthBridgeFee = computed(() => {
  if (!destinationIsEthereum.value) {
    return true
  }

  return amountInUsd.value.gt(ethBridgeFeeInUsd.value)
})

const transferAmountInUsd = computed(() =>
  transferAmount.value.multipliedBy(new BigNumberInBase(usdPrice.value))
)

const { valueToString: transferAmountInUsdToString } =
  useBigNumberFormatter(transferAmountInUsd)

const gasFeeInUsd = computed(() =>
  gasFee.multipliedBy(new BigNumberInBase(injTokenWithPrice.value.usdPrice))
)

const { valueToString: gasFeeInUsdToString } =
  useBigNumberFormatter(gasFeeInUsd)

const handlerFunction = computed(() => {
  if (bridgeType.value === BridgeType.Transfer) {
    return isBankToTradingAccount.value
      ? handleTransferToTradingAccount
      : handleTransferToBank
  }

  if (bridgeType.value === BridgeType.Deposit) {
    return handleDeposit
  }

  if (
    bridgeType.value === BridgeType.Withdraw &&
    destinationIsInjective.value
  ) {
    return handleWithdrawToInjective
  }

  // Withdraw to Ethereum
  return handleWithdraw
})

function handleModalClose() {
  resetForm()

  modalStore.closeModal(Modal.BridgeConfirm)
}

function handleConfirmation() {
  handleTransferTradingAccountTrack()

  handlerFunction.value()
}

function handleWithdrawToInjective() {
  status.setLoading()

  bankStore
    .transfer({
      amount: new BigNumberInBase(form[BridgeField.Amount]),
      denom: form[BridgeField.Token].denom,
      destination: form[BridgeField.Destination],
      memo: form[BridgeField.Memo],
      token: form[BridgeField.Token]
    })
    .then(() => {
      success({ title: t('bridge.withdrawToInjectiveAddressSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleTransferToTradingAccount() {
  status.setLoading()

  accountStore
    .deposit({
      amount: new BigNumberInBase(form[BridgeField.Amount]),
      token: form[BridgeField.Token]
    })
    .then(() => {
      success({ title: t('bridge.depositToTradingAccountSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleWithdraw() {
  status.setLoading()

  if (ethBridgeFee.value.gte(form[BridgeField.Amount])) {
    return
  }

  tokenStore
    .withdraw({
      bridgeFee: ethBridgeFee.value,
      token: form[BridgeField.Token],
      amount: new BigNumberInBase(form[BridgeField.Amount])
    })
    .then(() => {
      success({ title: t('bridge.withdrawFromInjectiveSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleDeposit() {
  status.setLoading()

  tokenStore
    .transfer({
      amount: new BigNumberInBase(form[BridgeField.Amount]),
      token: form[BridgeField.Token]
    })
    .then(() => {
      success({ title: t('bridge.depositToInjectiveSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleTransferToBank() {
  status.setLoading()

  accountStore
    .withdraw({
      amount: new BigNumberInBase(form[BridgeField.Amount]),
      token: form[BridgeField.Token]
    })
    .then(() => {
      success({ title: t('bridge.withdrawFromTradingAccountSuccess') })

      emit('form:submit')
      emitFundingRefresh()
    })
    .catch($onError)
    .finally(() => {
      status.setIdle()
    })
}

function handleTransferTradingAccountTrack() {
  amplitudeTracker.transferTradingAccountTrack({
    transferDirection: form[BridgeField.TransferDirection],
    token: form[BridgeField.Token].name,
    amount: form[BridgeField.Amount]
  })
}
</script>

<template>
  <AppModal
    :show="isModalOpen"
    sm
    data-cy="transfer-confirm-modal"
    @modal:closed="handleModalClose"
  >
    <template #title>
      <h3>
        <span v-if="bridgeType === BridgeType.Deposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span v-else-if="bridgeType === BridgeType.Withdraw">
          {{ $t('bridge.withdrawFromInjective') }}
        </span>
        <span v-else>
          {{ $t('bridge.transferFromToTradingAccount') }}
        </span>
      </h3>
    </template>

    <div>
      <div v-if="walletStore.isUserWalletConnected">
        <div v-if="!networkIsNotSupported">
          <h3 class="text-xl font-medium mt-6">
            {{ $t('bridge.confirmTransaction') }}
          </h3>

          <div v-if="form[BridgeField.Token]" class="text-center my-8">
            <CommonTokenIcon
              v-if="form[BridgeField.Token].logo"
              :token="form[BridgeField.Token]"
              xl
              class="mx-auto"
            />
            <BaseIcon
              v-else
              name="category-alt"
              class="text-gray-200 rounded-full w-10 h-10 mx-auto"
            />
            <p
              class="text-gray-200 text-2xl font-bold tracking-0.4 mt-4"
              data-cy="transfer-confirm-modal-value-text-content"
            >
              {{ amountToString }}
              {{ form[BridgeField.Token].symbol }}
            </p>
            <p
              v-if="amountInUsd.gt(0)"
              class="text-gray-500 text-sm tracking-0.4 mt-2"
              data-cy="transfer-confirm-modal-value-usd-text-content"
            >
              ${{ amountInUsdToString }}
            </p>
          </div>

          <div
            v-if="originNetworkMeta && destinationNetworkMeta"
            class="flex justify-between items-center mt-6"
          >
            <ModalsBridgeNetworkCard
              class="w-1/2"
              data-cy="transfer-confirm-modal-from-text-content"
              :hide-icon="
                originNetworkMeta.value === destinationNetworkMeta.value
              "
              :network-meta="originNetworkMeta"
            />

            <div
              class="bg-blue-500 min-w-6 h-6 mx-6 flex items-center justify-center rounded-full"
            >
              <BaseIcon
                name="arrow"
                class="text-gray-1000 w-4 h-4 rotate-180"
              />
            </div>

            <ModalsBridgeNetworkCard
              class="w-1/2"
              data-cy="transfer-confirm-modal-to-text-content"
              :hide-icon="
                originNetworkMeta.value === destinationNetworkMeta.value
              "
              :network-meta="destinationNetworkMeta"
            />
          </div>

          <div v-if="originIsInjective" class="mt-6">
            <!-- Amount -->
            <ModalsBridgeConfirmRow class="mb-4">
              <template #title>
                {{ $t('bridge.amount') }}
              </template>

              <template #amount>
                <span data-cy="transfer-confirm-modal-amount-text-content">
                  {{ amountToString }}
                  {{ form[BridgeField.Token].symbol }}
                </span>
              </template>

              <template #amountInUsd>
                <span data-cy="transfer-confirm-modal-amount-usd-text-content">
                  ${{ amountInUsdToString }}
                </span>
              </template>
            </ModalsBridgeConfirmRow>

            <!-- Bridge Fee -->
            <ModalsBridgeConfirmRow v-if="destinationIsEthereum" class="mb-4">
              <template #title>
                {{ $t('bridge.bridgeFee') }}
              </template>

              <template #amount>
                <span data-cy="transfer-confirm-modal-bridge-fee-text-content">
                  {{ ethBridgeFeeToString }}
                  {{ form[BridgeField.Token].symbol }}
                </span>
              </template>

              <template #amountInUsd>
                <span
                  data-cy="transfer-confirm-modal-bridge-fee-usd-text-content"
                >
                  ${{ ethBridgeFeeInUsdToString }}
                </span>
              </template>
            </ModalsBridgeConfirmRow>
          </div>

          <div v-if="originIsInjective">
            <ModalsBridgeConfirmRow class="mb-4" bold>
              <template #title>
                {{ $t('bridge.transferAmount') }}
              </template>

              <template #amount>
                <span
                  data-cy="transfer-confirm-modal-transfer-amount-text-content"
                >
                  {{ transferAmountToString }}
                  {{ form[BridgeField.Token].symbol }}
                </span>
              </template>

              <template #amountInUsd>
                <span
                  data-cy="transfer-confirm-modal-transfer-amount-usd-text-content"
                >
                  ${{ transferAmountInUsdToString }}
                </span>
              </template>
            </ModalsBridgeConfirmRow>

            <!-- Fee Delegation for all wallets not active -->
            <ModalsBridgeConfirmRow v-if="false" bold class="mb-6">
              <template #title>
                {{ $t('bridge.gasFee') }}
              </template>

              <template #amount>
                <span data-cy="transfer-confirm-modal-gas-fee-text-content">
                  {{ gasFeeToString }} {{ injToken.symbol }}
                </span>
              </template>

              <template #amountInUsd>
                <span data-cy="transfer-confirm-modal-gas-fee-usd-text-content">
                  ${{ gasFeeInUsdToString }}
                </span>
              </template>
            </ModalsBridgeConfirmRow>

            <!-- Fee Delegation for all wallets active -->
            <ModalsBridgeConfirmRow v-else bold class="mb-6">
              <template #title>
                {{ $t('bridge.gasFee') }}
              </template>

              <template #amount>
                <span data-cy="transfer-confirm-modal-gas-fee-text-content">
                  {{ $t('common.waived') }}
                </span>
              </template>
            </ModalsBridgeConfirmRow>
          </div>

          <div class="text-center mt-6">
            <AppButton
              lg
              class="w-full font-semibold rounded bg-blue-500 text-blue-900"
              :disabled="
                !amountLargerThanEthBridgeFee ||
                (originIsInjective && !bankStore.hasEnoughInjForGas)
              "
              :status="status"
              data-cy="transfer-confirm-modal-confirm-button"
              @click="handleConfirmation"
            >
              <span v-if="originIsInjective && !bankStore.hasEnoughInjForGas">
                {{ $t('bridge.insufficientINJForGas') }}
              </span>
              <span v-if="!amountLargerThanEthBridgeFee">
                {{ $t('bridge.insufficientAmount') }}
              </span>
              <span v-else>
                {{ $t('bridge.confirm') }}
              </span>
            </AppButton>
          </div>
        </div>
        <ModalsBridgeNotSupportedBridgeTypeNote
          v-else
          v-bind="{
            bridgeType,
            form,
            selectedNetwork: form[BridgeField.BridgingNetwork]
          }"
        />
      </div>
      <CommonUserNotConnectedNote v-else />
    </div>
  </AppModal>
</template>
