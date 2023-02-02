<script setup lang="ts">
import { PropType } from 'vue'
import { BigNumberInBase, Status } from '@injectivelabs/utils'
import {
  BRIDGE_FEE_IN_USD,
  ZERO_IN_BASE,
  TokenWithUsdPrice,
  TokenWithBalanceAndPrice
} from '@injectivelabs/sdk-ui-ts'
import { useI18n } from 'vue-i18n'
import { Modal, BridgeType, BridgeField } from '@/types/enums'
import { BusEvents, BridgeForm } from '@/types'
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

const props = defineProps({
  bridgeType: {
    required: true,
    type: String as PropType<BridgeType>
  },

  formValues: {
    required: true,
    type: Object as PropType<BridgeForm>
  }
})

const emit = defineEmits<{
  (e: 'form:reset'): void
  (e: 'form:submit'): void
}>()

const {
  originNetworkMeta,
  destinationNetworkMeta,
  destinationIsEthereumNetwork,
  destinationIsInjective,
  isBankToTradingAccount,
  networkIsNotSupported,
  originIsInjectiveNetwork
} = useBridgeNetwork({
  bridgeType: computed(() => props.bridgeType),
  bridgeForm: computed(() => props.formValues)
})

const { emit: emitFundingRefresh } = useEventBus<void>(BusEvents.FundingRefresh)

const status = reactive(new Status())

const injTokenWithPrice = computed(() => {
  return {
    ...injToken,
    usdPrice: tokenStore.injUsdPrice
  } as TokenWithUsdPrice
})

const tokenWithBalanceAndPrice = computed<TokenWithBalanceAndPrice | undefined>(
  () => {
    return tokenStore.erc20TokensWithBalanceAndPriceFromBank.find(
      (token) => token.denom === props.formValues[BridgeField.Token].denom
    )
  }
)

const usdPrice = computed(() => {
  if (
    tokenWithBalanceAndPrice.value &&
    tokenWithBalanceAndPrice.value.usdPrice
  ) {
    return new BigNumberInBase(tokenWithBalanceAndPrice.value.usdPrice || 0)
  }

  return ZERO_IN_BASE
})

const amount = computed(() => {
  return new BigNumberInBase(props.formValues[BridgeField.Amount] || 0)
})

const { valueToString: amountToString } = useBigNumberFormatter(amount, {
  decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
})

const amountInUsd = computed(() => {
  return amount.value.multipliedBy(new BigNumberInBase(usdPrice.value))
})

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

const ethBridgeFeeInUsd = computed(() => {
  return ethBridgeFee.value.multipliedBy(new BigNumberInBase(usdPrice.value))
})

const { valueToString: ethBridgeFeeInUsdToString } =
  useBigNumberFormatter(ethBridgeFeeInUsd)

const gasFee = computed(() => {
  return new BigNumberInBase(INJ_GAS_FEE)
})

const gasFeeToString = computed(() => {
  return gasFee.value.toFormat()
})

const gasFeeInUsd = computed(() => {
  return gasFee.value.multipliedBy(
    new BigNumberInBase(injTokenWithPrice.value.usdPrice)
  )
})

const transferAmount = computed(() => {
  if (destinationIsEthereumNetwork.value) {
    return amount.value.minus(ethBridgeFee.value)
  }

  return amount.value
})

const amountLargerThanEthBridgeFee = computed(() => {
  if (!destinationIsEthereumNetwork.value) {
    return true
  }

  return amountInUsd.value.gt(ethBridgeFeeInUsd.value)
})

const transferAmountInUsd = computed(() =>
  transferAmount.value.multipliedBy(new BigNumberInBase(usdPrice.value))
)

const { valueToString: transferAmountToString } = useBigNumberFormatter(
  transferAmount,
  {
    decimalPlaces: UI_DEFAULT_DISPLAY_DECIMALS
  }
)

const { valueToString: gasFeeInUsdToString } =
  useBigNumberFormatter(gasFeeInUsd)

const { valueToString: transferAmountInUsdToString } =
  useBigNumberFormatter(transferAmountInUsd)

const handlerFunction = computed(() => {
  if (props.bridgeType === BridgeType.Transfer) {
    return isBankToTradingAccount.value
      ? handleTransferToTradingAccount
      : handleTransferToBank
  }

  if (props.bridgeType === BridgeType.Deposit) {
    return handleDeposit
  }

  if (
    props.bridgeType === BridgeType.Withdraw &&
    destinationIsInjective.value
  ) {
    return handleWithdrawToInjective
  }

  // Withdraw to Ethereum
  return handleWithdraw
})

function handleModalClose() {
  emit('form:reset')
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
      amount: new BigNumberInBase(props.formValues[BridgeField.Amount]),
      denom: props.formValues[BridgeField.Token].denom,
      destination: props.formValues[BridgeField.Destination],
      memo: props.formValues[BridgeField.Memo],
      token: props.formValues[BridgeField.Token]
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
      amount: new BigNumberInBase(props.formValues[BridgeField.Amount]),
      token: props.formValues[BridgeField.Token]
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

  if (ethBridgeFee.value.gte(props.formValues[BridgeField.Amount])) {
    return
  }

  tokenStore
    .withdraw({
      bridgeFee: ethBridgeFee.value,
      token: props.formValues[BridgeField.Token],
      amount: new BigNumberInBase(props.formValues[BridgeField.Amount])
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
      amount: new BigNumberInBase(props.formValues[BridgeField.Amount]),
      token: props.formValues[BridgeField.Token]
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
      amount: new BigNumberInBase(props.formValues[BridgeField.Amount]),
      token: props.formValues[BridgeField.Token]
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
    transferDirection: props.formValues[BridgeField.TransferDirection],
    token: props.formValues[BridgeField.Token].name,
    amount: props.formValues[BridgeField.Amount]
  })
}
</script>

<template>
  <AppModalWrapper
    :show="modalStore.modals[Modal.BridgeConfirm]"
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

          <div v-if="originIsInjectiveNetwork" class="mt-6">
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
            <ModalsBridgeConfirmRow
              v-if="destinationIsEthereumNetwork"
              class="mb-4"
            >
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

          <div v-if="originIsInjectiveNetwork">
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
              :disabled="
                !amountLargerThanEthBridgeFee ||
                (originIsInjectiveNetwork && !walletStore.hasEnoughInjForGas)
              "
              :status="status"
              data-cy="transfer-confirm-modal-confirm-button"
              @click="handleConfirmation"
            >
              <span
                v-if="
                  originIsInjectiveNetwork && !walletStore.hasEnoughInjForGas
                "
              >
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
            formValues,
            selectedNetwork: formValues[BridgeField.BridgingNetwork],
            bridgeType
          }"
        />
      </div>
      <CommonUserNotConnectedNote v-else />
    </div>
  </AppModalWrapper>
</template>
