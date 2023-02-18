<script setup lang="ts">
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import {
  ZERO_IN_BASE,
  BRIDGE_FEE_IN_USD,
  BalanceWithTokenAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { useI18n } from 'vue-i18n'
import { TokenWithPrice } from '@injectivelabs/token-metadata'
import { Modal, BridgeField, BridgeForm, BusEvents } from '@/types'
import { injToken } from '@/app/data/token'
import {
  INJ_GAS_FEE,
  UI_DEFAULT_DISPLAY_DECIMALS,
  UI_DEFAULT_MIN_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { amplitudeTracker } from '@/app/providers/AmplitudeTracker'

const bankStore = useBankStore()
const tokenStore = useTokenStore()
const peggyStore = usePeggyStore()
const modalStore = useModalStore()
const walletStore = useWalletStore()
const accountStore = useAccountStore()
const { t } = useI18n()
const { success } = useNotifications()
const { $onError } = useNuxtApp()

const formValues = useFormValues<BridgeForm>()
const resetForm = useResetForm()

const emit = defineEmits<{
  (e: 'form:submit'): void
}>()

const {
  isDeposit,
  isTransfer,
  isWithdraw,
  originNetworkMeta,
  destinationNetworkMeta,
  destinationIsEthereum,
  destinationIsInjective,
  isBankToTradingAccount,
  networkIsNotSupported,
  originIsInjective
} = useBridgeState({
  formValues
})

const { emit: emitFundingRefresh } = useEventBus<void>(BusEvents.FundingRefresh)

const gasFee = new BigNumberInBase(INJ_GAS_FEE)
const gasFeeToString = gasFee.toFormat()

const status = reactive(new Status())

const isModalOpen = computed(() => modalStore.modals[Modal.BridgeConfirm])

const injTokenWithPrice = computed<TokenWithPrice>(() => ({
  ...injToken,
  usdPrice: tokenStore.injUsdPrice
}))

const balanceWithTokenAndPrice = computed(() => {
  return peggyStore.tradeableErc20BalancesWithTokenAndPrice.find(
    (token) => token.denom === formValues.value[BridgeField.Token].denom
  ) as BalanceWithTokenAndPrice | undefined
})

const usdPrice = computed(
  () => new BigNumberInBase(balanceWithTokenAndPrice.value?.usdPrice || 0)
)

const amount = computed(
  () => new BigNumberInBase(formValues.value[BridgeField.Amount] || 0)
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
  if (!balanceWithTokenAndPrice.value) {
    return ZERO_IN_BASE
  }

  if (!balanceWithTokenAndPrice.value.usdPrice) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(BRIDGE_FEE_IN_USD).dividedBy(
    balanceWithTokenAndPrice.value.usdPrice
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

const isConfirmationDisabled = computed(() => {
  return (
    transferAmount.value.lte(0) ||
    (originIsInjective && !bankStore.hasEnoughInjForGas)
  )
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
  if (isTransfer.value) {
    return isBankToTradingAccount.value
      ? handleTransferToTradingAccount
      : handleTransferToBank
  }

  if (isDeposit.value) {
    return handleDeposit
  }

  if (isWithdraw.value && destinationIsInjective.value) {
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
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount]),
      denom: formValues.value[BridgeField.Token].denom,
      destination: formValues.value[BridgeField.Destination],
      memo: formValues.value[BridgeField.Memo],
      token: formValues.value[BridgeField.Token]
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
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount]),
      token: formValues.value[BridgeField.Token]
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

  if (ethBridgeFee.value.gte(formValues.value[BridgeField.Amount])) {
    return
  }

  peggyStore
    .withdraw({
      bridgeFee: ethBridgeFee.value,
      token: formValues.value[BridgeField.Token],
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount])
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

  peggyStore
    .transfer({
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount]),
      token: formValues.value[BridgeField.Token]
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
      amount: new BigNumberInBase(formValues.value[BridgeField.Amount]),
      token: formValues.value[BridgeField.Token]
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
    transferDirection: formValues.value[BridgeField.TransferDirection],
    token: formValues.value[BridgeField.Token].name,
    amount: formValues.value[BridgeField.Amount]
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
        <span v-if="isDeposit">
          {{ $t('bridge.depositToInjective') }}
        </span>
        <span v-else-if="isWithdraw">
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

          <div v-if="formValues[BridgeField.Token]" class="text-center my-8">
            <CommonTokenIcon
              v-if="formValues[BridgeField.Token].logo"
              :token="formValues[BridgeField.Token]"
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
              {{ formValues[BridgeField.Token].symbol }}
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
                  {{ formValues[BridgeField.Token].symbol }}
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
                  {{ formValues[BridgeField.Token].symbol }}
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
                  {{ formValues[BridgeField.Token].symbol }}
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
              :disabled="isConfirmationDisabled"
              :status="status"
              data-cy="transfer-confirm-modal-confirm-button"
              @click="handleConfirmation"
            >
              <span v-if="originIsInjective && !bankStore.hasEnoughInjForGas">
                {{ $t('bridge.insufficientINJForGas') }}
              </span>
              <span v-if="transferAmount.lte(0)">
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
            selectedNetwork: formValues[BridgeField.BridgingNetwork]
          }"
        />
      </div>
      <CommonUserNotConnectedNote v-else />
    </div>
  </AppModal>
</template>
