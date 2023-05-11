<script setup lang="ts">
import {
  BalanceWithToken,
  BalanceWithTokenWithErc20Balance,
  BridgingNetwork,
  ZERO_IN_BASE
} from '@injectivelabs/sdk-ui-ts'
import {
  BigNumberInBase,
  BigNumberInWei,
  INJ_DENOM
} from '@injectivelabs/utils'
import { BridgeField, BridgeForm, BridgeType, Modal } from '@/types'
import {
  INJ_GAS_BUFFER_FOR_BRIDGE,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '~/app/utils/constants'
import { isTokenWormholeToken } from '~/app/data/bridge'

const modalStore = useModalStore()
const walletStore = useWalletStore()

useStringField({
  name: BridgeField.BridgeType,
  initialValue: BridgeType.Deposit
})

const formValues = useFormValues<BridgeForm>()
const formErrors = useFormErrors()
const { networkIsNotSupported, originIsEthereum } = useBridgeState({
  formValues
})
const { transferableBalancesWithToken } = useBridgeBalance({
  formValues
})

const { value: denom } = useStringField({
  name: BridgeField.Denom,
  initialValue: formValues.value[BridgeField.Denom]
})

onMounted(() => {
  handlePreFillCosmosWallet()
})

const hasFormErrors = computed(() => Object.keys(formErrors.value).length > 0)

const balanceWithToken = computed(() => {
  const balanceWithToken = transferableBalancesWithToken.value.find(
    (b) => b.token.denom === denom.value
  )

  if (!balanceWithToken) {
    return
  }

  if (balanceWithToken.denom !== INJ_DENOM) {
    return balanceWithToken
  }

  const noGasBufferNeededForTransfer = walletStore.isWalletExemptFromGasFee

  if (noGasBufferNeededForTransfer) {
    return balanceWithToken
  }

  const transferableBalance = new BigNumberInWei(balanceWithToken.balance)
    .toBase()
    .minus(INJ_GAS_BUFFER_FOR_BRIDGE)
  const transferableBalanceCapped = new BigNumberInWei(
    transferableBalance.gt(0) ? transferableBalance : 0
  )

  return {
    ...balanceWithToken,
    balance: transferableBalanceCapped.toFixed()
  } as BalanceWithToken
})

const maxDecimals = computed(() => {
  const defaultDecimalsLessThanTokenDecimals =
    UI_DEFAULT_DISPLAY_DECIMALS < formValues.value[BridgeField.Token].decimals

  if (defaultDecimalsLessThanTokenDecimals) {
    return UI_DEFAULT_DISPLAY_DECIMALS
  }

  return formValues.value[BridgeField.Token].decimals
})

const shouldConnectMetamask = computed(
  () => walletStore.isCosmosWallet && originIsEthereum.value
)

const allowance = computed(() => {
  if (!balanceWithToken.value) {
    return ZERO_IN_BASE
  }

  const balanceWithTokenWithErc20Balance =
    balanceWithToken.value as BalanceWithTokenWithErc20Balance

  return new BigNumberInWei(
    balanceWithTokenWithErc20Balance.erc20Balance?.allowance || 0
  ).toBase(balanceWithTokenWithErc20Balance.token.decimals)
})

const needsAllowanceSet = computed(
  () =>
    originIsEthereum.value &&
    allowance.value.lt(formValues.value[BridgeField.Amount]) &&
    new BigNumberInBase(balanceWithToken.value?.balance || '').gt(0)
)

function handleBridgeConfirmed() {
  modalStore.closeModal(Modal.BridgeConfirm)
}

function handleBridgeConfirmation() {
  nextTick(() => {
    modalStore.openModal({ type: Modal.BridgeConfirm })

    if (isTokenWormholeToken(formValues.value[BridgeField.Token])) {
      formValues.value[BridgeField.BridgingNetwork] = BridgingNetwork.EthereumWh
    }
  })
}

function handleAmountChange({ amount }: { amount: string }) {
  formValues.value[BridgeField.Amount] = amount
}

function handleTokenChange() {
  nextTick(() => {
    if (balanceWithToken.value) {
      formValues.value[BridgeField.Amount] = ''
      formValues.value[BridgeField.Token] = balanceWithToken.value.token
    }
  })
}

function handlePreFillCosmosWallet() {
  if (walletStore.isCosmosWallet) {
    formValues.value[BridgeField.BridgingNetwork] = BridgingNetwork.CosmosHub
  }
}
</script>

<template>
  <ModalsBridgeNotSupportedBridgeTypeNote
    v-if="networkIsNotSupported"
    v-bind="{
      selectedNetwork: formValues[BridgeField.BridgingNetwork]
    }"
  />

  <div class="mt-6">
    <div>
      <AppSelectToken
        v-model:denom="denom"
        v-bind="{
          maxDecimals,
          required: true,
          amountFieldName: BridgeField.Amount,
          options: transferableBalancesWithToken
        }"
        @update:denom="handleTokenChange"
        @update:max="handleAmountChange"
      >
        <span> {{ $t('bridge.amount') }} </span>
      </AppSelectToken>
    </div>
    <div class="mt-6 text-center">
      <AppButton
        v-if="shouldConnectMetamask"
        lg
        class="w-full font-semibold rounded bg-blue-500 text-blue-900"
        data-cy="transfer-modal-transfer-now-button"
        :disabled="true"
        @click="() => {}"
      >
        {{ $t('bridge.keplrConnectedForEthereum') }}
      </AppButton>

      <CommonAllowance
        v-if="needsAllowanceSet && balanceWithToken"
        v-bind="{
          allowance,
          balanceWithToken: balanceWithToken as BalanceWithTokenWithErc20Balance
        }"
      />

      <AppButton
        v-else
        lg
        :disabled="hasFormErrors || formValues[BridgeField.Amount] === ''"
        class="w-full font-semibold rounded bg-blue-500 text-blue-900"
        data-cy="transfer-modal-transfer-now-button"
        @click="handleBridgeConfirmation"
      >
        <span v-if="formValues[BridgeField.BridgeType] === BridgeType.Deposit">
          {{ $t('bridge.depositNow') }}
        </span>
      </AppButton>
    </div>

    <ModalsBridgeConfirm @form:submit="handleBridgeConfirmed" />
  </div>
</template>
